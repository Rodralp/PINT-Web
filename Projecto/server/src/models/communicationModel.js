import fs from 'node:fs';
import path from 'node:path';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const uploadsDir = path.resolve(globalThis.process?.cwd?.() || '.', 'server', 'uploads');
const allowedLogTypes = new Set(['mensagem', 'aviso', 'importante']);

const normalizeRoles = (rolesValue) => {
  const rawRoles = Array.isArray(rolesValue)
    ? rolesValue
    : typeof rolesValue === 'string'
      ? rolesValue.split(';')
      : [];

  return rawRoles
    .map((role) => String(role).trim().toLowerCase())
    .filter(Boolean);
};

const normalizeServiceLines = (value) => {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const buildSummary = (message) => {
  const trimmed = String(message || '').trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 117).trim()}...`;
};

const normalizeLogType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return allowedLogTypes.has(normalized) ? normalized : 'mensagem';
};

const normalizePriority = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 2;
};

const normalizeRecipientIds = (ids) => {
  const raw = Array.isArray(ids) ? ids : [];
  return [...new Set(raw
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry > 0))];
};

const deleteUploadedFiles = async (files) => {
  const safeFiles = Array.isArray(files) ? files : [];
  await Promise.all(safeFiles.map(async (file) => {
    const storedName = path.basename(String(file?.filename || '').trim());
    if (!storedName) {
      return;
    }

    const resolvedPath = path.resolve(uploadsDir, storedName);
    const isInsideUploadsDir = resolvedPath === uploadsDir || resolvedPath.startsWith(`${uploadsDir}${path.sep}`);
    if (!isInsideUploadsDir) {
      return;
    }

    try {
      await fs.promises.unlink(resolvedPath);
    } catch (error) {
      if (error?.code !== 'ENOENT') {
        // Ignore cleanup errors to keep best-effort behavior.
      }
    }
  }));
};

export const communicationModel = {
  async listRecipients() {
    const rows = await sequelize.query(
      `
        SELECT
          u.nutilizador AS id,
          u.nome,
          u.email,
          u.permissoes,
          u.status,
          COALESCE(sl.service_lines, '') AS service_lines
        FROM utilizador u
        LEFT JOIN (
          SELECT
            s.nutilizador,
            STRING_AGG(sl.sline, ', ' ORDER BY sl.sline) AS service_lines
          FROM sll_leader_sl s
          JOIN service_line sl ON sl.nsline = s.nsline
          GROUP BY s.nutilizador
        ) sl ON sl.nutilizador = u.nutilizador
        WHERE LOWER(u.status) <> 'pendente'
        ORDER BY u.nome ASC
      `,
      { type: QueryTypes.SELECT },
    );

    const recipients = rows.map((row) => {
      const roles = normalizeRoles(row.permissoes);
      const serviceLines = normalizeServiceLines(row.service_lines);

      return {
        id: Number(row.id),
        nome: row.nome,
        email: row.email,
        role: roles[0] || 'consultor',
        roles,
        status: row.status,
        serviceLines,
      };
    });

    const serviceLineRows = await sequelize.query(
      `
        SELECT nsline AS id, sline AS name
        FROM service_line
        ORDER BY sline ASC
      `,
      { type: QueryTypes.SELECT },
    );

    return {
      recipients,
      serviceLines: serviceLineRows.map((row) => ({
        id: Number(row.id),
        name: row.name,
      })),
    };
  },

  async createAnnouncement({ accountId, title, message, type, priority, recipientIds, files }) {
    const parsedAccountId = Number(accountId);
    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
      const error = new Error('Invalid account id.');
      error.statusCode = 400;
      throw error;
    }

    const trimmedTitle = String(title || '').trim();
    const trimmedMessage = String(message || '').trim();
    if (!trimmedTitle || !trimmedMessage) {
      const error = new Error('Missing required fields.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedRecipients = normalizeRecipientIds(recipientIds);
    if (normalizedRecipients.length === 0) {
      const error = new Error('At least one recipient is required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedType = normalizeLogType(type);
    const normalizedPriority = normalizePriority(priority);
    const summary = buildSummary(trimmedMessage);
    const transaction = await sequelize.transaction();

    try {
      const [createdLog] = await sequelize.query(
        `
          INSERT INTO logs (nutilizador, data_log, tipo_log, titulo, mensagem, resumo, prioridade)
          VALUES (:accountId, CURRENT_DATE, :type, :title, :message, :summary, :priority)
          RETURNING nlog, data_log
        `,
        {
          replacements: {
            accountId: parsedAccountId,
            type: normalizedType,
            title: trimmedTitle,
            message: trimmedMessage,
            summary,
            priority: normalizedPriority,
          },
          type: QueryTypes.SELECT,
          transaction,
        },
      );

      const logId = Number(createdLog?.nlog);
      if (!logId) {
        const error = new Error('Failed to create log entry.');
        error.statusCode = 500;
        throw error;
      }

      for (const recipientId of normalizedRecipients) {
        await sequelize.query(
          `
            INSERT INTO notificacao (nutilizador, nlog, lida)
            VALUES (:recipientId, :logId, FALSE)
          `,
          {
            replacements: {
              recipientId,
              logId,
            },
            type: QueryTypes.INSERT,
            transaction,
          },
        );
      }

      const safeFiles = Array.isArray(files) ? files : [];
      for (const file of safeFiles) {
        const storedName = path.basename(String(file?.filename || '').trim());
        const originalName = String(file?.originalname || '').trim();
        if (!storedName || !originalName) {
          continue;
        }

        await sequelize.query(
          `
            INSERT INTO ficheiro_log (nlog, nome_original, nome_armazenado, tipo, tamanho, caminho)
            VALUES (:logId, :originalName, :storedName, :mimeType, :fileSize, :filePath)
          `,
          {
            replacements: {
              logId,
              originalName,
              storedName,
              mimeType: String(file?.mimetype || ''),
              fileSize: Number(file?.size) || 0,
              filePath: `uploads/${storedName}`,
            },
            type: QueryTypes.INSERT,
            transaction,
          },
        );
      }

      await transaction.commit();

      return {
        id: logId,
        date: createdLog?.data_log || null,
      };
    } catch (error) {
      await transaction.rollback();
      await deleteUploadedFiles(files);
      throw error;
    }
  },

  async getUserAnnouncements(accountId) {
    const parsedAccountId = Number(accountId);
    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
      const error = new Error('Invalid account id.');
      error.statusCode = 400;
      throw error;
    }

    const rows = await sequelize.query(
      `
        SELECT
          l.nlog AS id,
          l.titulo,
          l.mensagem,
          l.resumo,
          l.tipo_log,
          l.prioridade,
          l.data_log,
          u.nome AS author_name,
          u.email AS author_email
        FROM notificacao n
        JOIN logs l ON l.nlog = n.nlog
        LEFT JOIN utilizador u ON u.nutilizador = l.nutilizador
        WHERE n.nutilizador = :accountId
        ORDER BY l.data_log DESC, l.nlog DESC
      `,
      {
        replacements: { accountId: parsedAccountId },
        type: QueryTypes.SELECT,
      },
    );

    const logIds = rows.map((row) => Number(row.id)).filter((value) => Number.isInteger(value) && value > 0);
    const attachmentsByLog = new Map();

    if (logIds.length > 0) {
      const attachmentRows = await sequelize.query(
        `
          SELECT
            nflog AS id,
            nlog,
            nome_original,
            nome_armazenado,
            tipo,
            tamanho,
            caminho
          FROM ficheiro_log
          WHERE nlog IN (:logIds)
          ORDER BY nflog ASC
        `,
        {
          replacements: { logIds },
          type: QueryTypes.SELECT,
        },
      );

      attachmentRows.forEach((row) => {
        const logId = Number(row.nlog);
        if (!attachmentsByLog.has(logId)) {
          attachmentsByLog.set(logId, []);
        }

        attachmentsByLog.get(logId).push({
          id: Number(row.id),
          logId,
          originalName: row.nome_original,
          storedName: row.nome_armazenado,
          mimeType: row.tipo,
          size: Number(row.tamanho) || 0,
          path: row.caminho,
        });
      });
    }

    return rows.map((row) => ({
      id: Number(row.id),
      type: normalizeLogType(row.tipo_log),
      title: row.titulo || '',
      message: row.mensagem || '',
      summary: row.resumo || buildSummary(row.mensagem || ''),
      priority: Number(row.prioridade) || 2,
      date: row.data_log,
      author: row.author_name || 'Sistema',
      authorEmail: row.author_email || '',
      attachments: attachmentsByLog.get(Number(row.id)) || [],
    }));
  },

  async getUserNotifications(accountId) {
    const parsedAccountId = Number(accountId);
    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
      const error = new Error('Invalid account id.');
      error.statusCode = 400;
      throw error;
    }

    const rows = await sequelize.query(
      `
        SELECT
          n.nnotificacao AS id,
          n.lida,
          l.nlog AS log_id,
          l.titulo,
          l.resumo,
          l.tipo_log,
          l.data_log,
          u.nome AS author_name
        FROM notificacao n
        LEFT JOIN logs l ON l.nlog = n.nlog
        LEFT JOIN utilizador u ON u.nutilizador = l.nutilizador
        WHERE n.nutilizador = :accountId
        ORDER BY l.data_log DESC NULLS LAST, n.nnotificacao DESC
      `,
      {
        replacements: { accountId: parsedAccountId },
        type: QueryTypes.SELECT,
      },
    );

    return rows.map((row) => ({
      id: Number(row.id),
      logId: row.log_id ? Number(row.log_id) : null,
      isRead: Boolean(row.lida),
      title: row.titulo || 'Notificacao',
      summary: row.resumo || '',
      type: normalizeLogType(row.tipo_log),
      date: row.data_log,
      author: row.author_name || 'Sistema',
    }));
  },

  async markNotificationRead(accountId, notificationId) {
    const parsedAccountId = Number(accountId);
    const parsedNotificationId = Number(notificationId);

    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
      const error = new Error('Invalid account id.');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(parsedNotificationId) || parsedNotificationId <= 0) {
      const error = new Error('Invalid notification id.');
      error.statusCode = 400;
      throw error;
    }

    const [updated] = await sequelize.query(
      `
        UPDATE notificacao
        SET lida = TRUE
        WHERE nnotificacao = :notificationId
          AND nutilizador = :accountId
        RETURNING nnotificacao
      `,
      {
        replacements: {
          notificationId: parsedNotificationId,
          accountId: parsedAccountId,
        },
        type: QueryTypes.SELECT,
      },
    );

    return updated ? Number(updated.nnotificacao) : null;
  },

  async getAnnouncementAttachment(accountId, logId, fileId) {
    const parsedAccountId = Number(accountId);
    const parsedLogId = Number(logId);
    const parsedFileId = Number(fileId);

    if (!Number.isInteger(parsedAccountId) || parsedAccountId <= 0) {
      const error = new Error('Invalid account id.');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(parsedLogId) || parsedLogId <= 0) {
      const error = new Error('Invalid log id.');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isInteger(parsedFileId) || parsedFileId <= 0) {
      const error = new Error('Invalid file id.');
      error.statusCode = 400;
      throw error;
    }

    const [row] = await sequelize.query(
      `
        SELECT
          f.nflog AS id,
          f.nlog,
          f.nome_original,
          f.nome_armazenado
        FROM ficheiro_log f
        JOIN notificacao n ON n.nlog = f.nlog
        WHERE n.nutilizador = :accountId
          AND f.nlog = :logId
          AND f.nflog = :fileId
        LIMIT 1
      `,
      {
        replacements: {
          accountId: parsedAccountId,
          logId: parsedLogId,
          fileId: parsedFileId,
        },
        type: QueryTypes.SELECT,
      },
    );

    if (!row) {
      return null;
    }

    return {
      id: Number(row.id),
      logId: Number(row.nlog),
      originalName: row.nome_original,
      storedName: row.nome_armazenado,
    };
  },
};
