import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

export const Reminder = sequelize.define(
  'Reminder',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'account_id',
      references: {
        model: 'utilizador',
        key: 'nutilizador',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'reminders',
    underscored: true,
    hooks: {
      beforeCreate(reminder) {
        reminder.title = reminder.title.trim();
        reminder.description = reminder.description.trim();
      },
      beforeUpdate(reminder) {
        reminder.title = reminder.title.trim();
        reminder.description = reminder.description.trim();
      },
    },
  },
);