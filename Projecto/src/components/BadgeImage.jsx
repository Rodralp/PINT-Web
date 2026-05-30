import '../css/Shared/BadgeImage.css';

const badgeFrameByLevel = {
  badge_level_junior: '/badges/J%C3%BAnior.png',
  badge_level_intermediate: '/badges/Interm%C3%A9dio.png',
  badge_level_senior: '/badges/S%C3%A9nior.png',
  badge_level_specialist: '/badges/Especialista.png',
  badge_level_knowledge_lead: '/badges/L%C3%ADder%20de%20Conhecimento.png',
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const normalizeImageKey = (value) => {
  const cleanValue = String(value || '').trim();

  try {
    return decodeURI(cleanValue).toLowerCase();
  } catch {
    return cleanValue.toLowerCase();
  }
};

const resolveBadgeFrameImage = ({ levelKey, typeId, levelLabel }) => {
  const directKey = String(levelKey || typeId || '').trim();
  if (badgeFrameByLevel[directKey]) {
    return badgeFrameByLevel[directKey];
  }

  const normalized = normalizeText(`${levelKey || ''} ${typeId || ''} ${levelLabel || ''}`);

  if (normalized.includes('junior')) {
    return badgeFrameByLevel.badge_level_junior;
  }

  if (normalized.includes('intermediate') || normalized.includes('intermedio') || normalized.includes('interm')) {
    return badgeFrameByLevel.badge_level_intermediate;
  }

  if (normalized.includes('senior')) {
    return badgeFrameByLevel.badge_level_senior;
  }

  if (normalized.includes('especialista') || normalized.includes('specialist')) {
    return badgeFrameByLevel.badge_level_specialist;
  }

  if (normalized.includes('lider') || normalized.includes('lead')) {
    return badgeFrameByLevel.badge_level_knowledge_lead;
  }

  return null;
};

function BadgeImage({
  src,
  alt = '',
  className = '',
  frameSrc,
  levelKey,
  typeId,
  levelLabel,
}) {
  const resolvedFrameSrc = frameSrc === false
    ? null
    : frameSrc || resolveBadgeFrameImage({ levelKey, typeId, levelLabel });
  const resolvedImageSrc = src || resolvedFrameSrc;
  const shouldCompose =
    resolvedFrameSrc &&
    resolvedImageSrc &&
    normalizeImageKey(resolvedImageSrc) !== normalizeImageKey(resolvedFrameSrc);

  if (!shouldCompose) {
    return (
      <img
        className={className}
        src={resolvedImageSrc}
        alt={alt}
      />
    );
  }

  return (
    <span
      className={`badge-image-composite ${className}`.trim()}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <span className="badge-image-composite-stage" aria-hidden="true">
        <img className="badge-image-composite-frame" src={resolvedFrameSrc} alt="" />
        <img className="badge-image-composite-inner" src={resolvedImageSrc} alt="" />
      </span>
    </span>
  );
}

export { resolveBadgeFrameImage };
export default BadgeImage;
