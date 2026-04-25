import { serviceLineLeaderService } from '../services/serviceLineLeaderService.js';

const parseAccountId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getMyServiceLine = async (req, res) => {
  const accountId = parseAccountId(req.query?.accountId);

  if (!accountId) {
    res.status(400).json({ message: 'Account id is required.' });
    return;
  }

  try {
    const data = await serviceLineLeaderService.getMyServiceLine(accountId);

    if (!data) {
      res.status(404).json({ message: 'Service Line not found for this user.' });
      return;
    }

    res.status(200).json(data);
  } catch {
    res.status(500).json({ message: 'Failed to fetch Service Line data.' });
  }
};
