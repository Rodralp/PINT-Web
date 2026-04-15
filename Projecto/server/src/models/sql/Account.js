import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

export const Account = sequelize.define(
  'Account',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'consultor',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pendente',
    },
  },
  {
    tableName: 'accounts',
    underscored: true,
    hooks: {
      beforeValidate(account) {
        if (typeof account.email === 'string') {
          account.email = account.email.trim().toLowerCase();
        }
      },
      beforeCreate(account) {
        if (typeof account.nome === 'string') {
          account.nome = account.nome.trim();
        }
      },
    },
  },
);