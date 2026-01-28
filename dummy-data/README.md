# 🎲 HRMS Dummy Data Generator

Automated dummy data population for testing the HRMS application.

## 📦 What's Included

### 2 Tenants

- **TechCorp Solutions** (Premium Plan, 100 max employees)
  - Subdomain: `techcorp`
  - Admin: admin@techcorp.com / Admin@123

- **DesignHub Creative** (Basic Plan, 50 max employees)
  - Subdomain: `designhub`
  - Admin: admin@designhub.com / Admin@123

### 2 Organisations

- TechCorp Headquarters (HQ)
- DesignHub Studio (STUDIO)

### 5 Departments

- Engineering (TechCorp)
- Human Resources (TechCorp)
- Operations (TechCorp)
- Design (DesignHub)
- Marketing (DesignHub)

### 10+ Designations

- Engineering Manager, Senior Developer, Junior Developer
- HR Manager, HR Executive
- Operations Manager
- Design Lead, UI/UX Designer
- Marketing Manager, Marketing Executive

### 10 Employees

- 6 employees in TechCorp (across Engineering, HR, Operations)
- 4 employees in DesignHub (across Design, Marketing)
- Mix of roles: MANAGER, HR_MANAGER, EMPLOYEE

## 🚀 Usage

### 1. Install Dependencies

```bash
cd dummy-data
npm install
```

### 2. Configure API URL (Optional)

Edit `scripts/config.js` if your backend is not running on `http://localhost:5000`

### 3. Make Sure Backend is Running

```bash
cd backend
npm run dev
```

### 4. Populate Database

```bash
npm run populate
```

## 📋 Login Credentials

After population, you can login with:

### Tenant Admins

- **TechCorp**: admin@techcorp.com / Admin@123
- **DesignHub**: admin@designhub.com / Admin@123

### Sample Employees

All employees use default password: **Welcome@123**

**TechCorp Employees:**

- michael.chen@techcorp.com (Engineering Manager, MANAGER role)
- emily.rodriguez@techcorp.com (Senior Developer, EMPLOYEE role)
- david.kim@techcorp.com (Junior Developer, EMPLOYEE role)
- lisa.anderson@techcorp.com (HR Manager, HR_MANAGER role)
- james.wilson@techcorp.com (Operations Manager, MANAGER role)
- maria.garcia@techcorp.com (HR Executive, EMPLOYEE role)

**DesignHub Employees:**

- alex.thompson@designhub.com (Design Lead, MANAGER role)
- sophie.martinez@designhub.com (UI/UX Designer, EMPLOYEE role)
- ryan.taylor@designhub.com (Marketing Manager, MANAGER role)
- nina.patel@designhub.com (Marketing Executive, EMPLOYEE role)

## 📁 File Structure

```
dummy-data/
├── data/                    # JSON data files
│   ├── tenants.json
│   ├── organisations.json
│   ├── departments.json
│   ├── designations.json
│   └── employees.json
├── scripts/                 # Population scripts
│   ├── populate.js         # Main script
│   └── config.js           # Configuration
├── package.json
└── README.md
```

## 🔄 Re-running Population

To re-populate:

1. **Clear existing data** (manually or via database reset)
2. **Run populate script** again: `npm run populate`

## ⚙️ Customization

Edit JSON files in `data/` folder to customize:

- Tenant names, subdomains
- Organisation structures
- Department hierarchies
- Employee details

## 🐛 Troubleshooting

### "Failed to create tenant"

- Subdomain already exists in database
- Clear database and try again

### "Organisation/Department not found"

- Check that tenant subdomain and organisation codes match in JSON files
- Ensure proper relationships in data files

### "Connection refused"

- Make sure backend server is running
- Check API URL in `scripts/config.js`

## 📝 Notes

- All employees get default password: `Welcome@123`
- User roles are assigned during employee creation
- Relationships (dept → desig → emp) are automatically maintained
- Script uses actual API endpoints (not direct database access)
