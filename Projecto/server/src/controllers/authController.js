import { authService } from '../services/authService.js';

export const register = async (req, res) => {
  const { nome, email, senha } = req.body ?? {};

  if (!nome || !email || !senha) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const account = await authService.registerAccount({ nome, email, senha });
    if (!account) {
      res.status(409).json({ message: 'Email already registered.' });
      return;
    }

    res.status(201).json(account);
  } catch {
    res.status(500).json({ message: 'Failed to register account.' });
  }
};

export const login = async (req, res) => {
  const { email, senha } = req.body ?? {};

  if (!email || !senha) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const account = await authService.loginAccount({ email, senha });
    if (!account) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    res.status(200).json(account);
  } catch {
    res.status(500).json({ message: 'Failed to login.' });
  }
};

export const recoverPassword = async (req, res) => {
  const { email } = req.body ?? {};

  if (!email) {
    res.status(400).json({ message: 'Email is required.' });
    return;
  }

  try {
    const password = await authService.recoverPassword(email);
    if (!password) {
      res.status(404).json({ message: 'Email not found.' });
      return;
    }

    res.status(200).json({ password });
  } catch {
    res.status(500).json({ message: 'Failed to recover password.' });
  }
};
