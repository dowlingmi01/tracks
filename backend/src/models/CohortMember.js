const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CohortMember extends Model {
    static associate(models) {
      // Define associations
      CohortMember.belongsTo(models.Cohort, {
        foreignKey: 'cohortId',
        as: 'cohort'
      });

      CohortMember.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  CohortMember.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    cohortId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Cohorts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    },
    role: {
      type: DataTypes.ENUM('member', 'admin'),
      defaultValue: 'member',
      allowNull: false,
      validate: {
        isIn: [['member', 'admin']]
      }
    }
  }, {
    sequelize,
    modelName: 'CohortMember',
    tableName: 'CohortMembers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['cohortId', 'userId'],
        name: 'unique_cohort_member'
      },
      {
        fields: ['cohortId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['role']
      }
    ]
  });

  return CohortMember;
};