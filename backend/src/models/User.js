'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define association with Company
      User.belongsTo(models.Company, {
        foreignKey: 'companyId',
        as: 'company',
        onDelete: 'SET NULL', // If company is deleted, keep user but set companyId to null
        onUpdate: 'CASCADE'   // If company ID changes, update the reference
      });
    }

    // Instance method to check if user is admin
    isAdmin() {
      return this.role === 'ADMIN' || this.role === 'SUPERADMIN';
    }

    // Instance method to get full name
    getFullName() {
      return `${this.firstName} ${this.lastName || ''}`.trim();
    }

    // Instance method to safely return user data without sensitive info
    toSafeObject() {
      const { id, email, firstName, lastName, role, companyId, createdAt, updatedAt } = this;
      return { id, email, firstName, lastName, role, companyId, createdAt, updatedAt };
    }

    // Compare password method
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notNull: {
          msg: 'Email address is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required'
        },
        len: {
          args: [6, 100],
          msg: 'Password must be between 6 and 100 characters'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'First name is required'
        },
        len: {
          args: [1, 50],
          msg: 'First name must be between 1 and 50 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Last name must be less than 50 characters'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('SUPERADMIN', 'ADMIN', 'USER'),
      defaultValue: 'USER',
      validate: {
        isIn: {
          args: [['SUPERADMIN', 'ADMIN', 'USER']],
          msg: 'Invalid role specified'
        }
      }
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Companies',
        key: 'id'
      },
      validate: {
        async isValidCompany(value) {
          if (value) {
            const company = await sequelize.models.Company.findByPk(value);
            if (!company) {
              throw new Error('Invalid company ID specified');
            }
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      // Hash password before saving
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Validate company-role relationship
      beforeValidate: async (user) => {
        // If user is SUPERADMIN, they shouldn't be associated with a company
        if (user.role === 'SUPERADMIN' && user.companyId) {
          throw new Error('SUPERADMIN users cannot be associated with a company');
        }
        // If user is not SUPERADMIN, they must be associated with a company
        if (user.role !== 'SUPERADMIN' && !user.companyId) {
          throw new Error('Non-SUPERADMIN users must be associated with a company');
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] } // By default, don't include password in queries
    },
    scopes: {
      withPassword: {
        attributes: {} // Include all attributes, including password
      },
      active: {
        where: { active: true }
      }
    }
  });

  return User;
};