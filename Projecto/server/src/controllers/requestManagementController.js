import { requestManagementService } from '../services/requestManagementService.js';

const parsePositiveId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getManagedRequests = async (req, res) => {
  const role = String(req.params?.role || '').trim();
  const accountId = parsePositiveId(req.query?.accountId);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await requestManagementService.getManagedRequests(role, accountId);
    res.status(200).json(data);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    res.status(statusCode).json({ message: error?.message || 'Failed to fetch requests.' });
  }
};

export const getManagedRequestById = async (req, res) => {
  const role = String(req.params?.role || '').trim();
  const accountId = parsePositiveId(req.query?.accountId);
  const requestId = parsePositiveId(req.params?.requestId);

  if (!accountId || !requestId) {
    res.status(400).json({ message: 'Account id and request id are required.' });
    return;
  }

  try {
    const data = await requestManagementService.getManagedRequestById(role, accountId, requestId);
    if (!data) {
      res.status(404).json({ message: 'Request not found.' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    res.status(statusCode).json({ message: error?.message || 'Failed to fetch request details.' });
  }
};

export const submitManagedRequestDecision = async (req, res) => {
  const role = String(req.params?.role || '').trim();
  const requestId = parsePositiveId(req.params?.requestId);
  const accountId = parsePositiveId(req.body?.accountId);
  const decision = String(req.body?.decision || '').trim();
  const comment = String(req.body?.comment || '').trim();

  if (!requestId || !accountId || !decision) {
    res.status(400).json({ message: 'Account id, request id and decision are required.' });
    return;
  }

  try {
    const data = await requestManagementService.submitDecision(role, accountId, requestId, { decision, comment });
    if (!data) {
      res.status(404).json({ message: 'Request not found.' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    res.status(statusCode).json({ message: error?.message || 'Failed to submit decision.' });
  }
};
