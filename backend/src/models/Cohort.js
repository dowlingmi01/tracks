const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cohort extends Model {
    static associate(models) {
      // Cohort belongs to a Company
      Cohort.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'CASCADE'
      });

      // Cohort has many Users through CohortMember
      Cohort.belongsToMany(models.User, {
        through: models.CohortMember,  // Use model reference instead of string
        as: 'members',
        foreignKey: 'cohortId',
        otherKey: 'userId'
      });

      // Add direct access to CohortMembers if needed
      Cohort.hasMany(models.CohortMember, {
        foreignKey: 'cohortId',
        as: 'memberships'
      });
    }
  }

  Cohort.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),  // Add length limit
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      defaultValue: 'active',
      allowNull: false,  // Add not null constraint
      validate: {
        isIn: [['active', 'archived']]
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        startDateBeforeEnd(value) {
          if (this.endDate && value > this.endDate) {
            throw new Error('Start date must be before end date');
          }
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
        endDateAfterStart(value) {
          if (this.startDate && value < this.startDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Cohort',
    tableName: 'Cohorts',
    timestamps: true,
    indexes: [
      {
        fields: ['companyId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['name']
      }
    ]
  });

  return Cohort;
};