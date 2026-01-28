import axios from "axios";
import chalk from "chalk";
import { readFile } from "fs/promises";
import { config } from "./config.js";

const { apiBaseUrl, defaultPassword } = config;

// Storage for created IDs
const createdData = {
  tenants: {},
  organisations: {},
  departments: {},
  designations: {},
  employees: {},
};

// Helper function to read JSON file
async function readJsonFile(filename) {
  const data = await readFile(`./data/${filename}`, "utf-8");
  return JSON.parse(data);
}

// Helper function to make API calls with tenant header
async function apiCall(method, endpoint, data, tenantSubdomain = null) {
  try {
    const headers = {};
    if (tenantSubdomain) {
      headers["x-tenant-id"] = tenantSubdomain;
    }

    const response = await axios({
      method,
      url: `${apiBaseUrl}${endpoint}`,
      data,
      headers,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

// Step 1: Create Tenants
async function createTenants() {
  console.log(chalk.blue("\n📦 Creating Tenants..."));
  const tenants = await readJsonFile("tenants.json");

  for (const tenant of tenants) {
    try {
      const response = await apiCall("POST", "/auth/register", {
        name: tenant.name,
        // subdomain: tenant.subdomain,
        email: tenant.email,
        // phone: tenant.phone,
        // subscriptionTier: tenant.subscriptionTier,
        // maxEmployees: tenant.maxEmployees,
        // adminFirstName: tenant.adminUser.firstName,
        // adminLastName: tenant.adminUser.lastName,
        // adminEmail: tenant.adminUser.email,
        password: tenant.adminUser.password,
      });

      createdData.tenants[tenant.subdomain] = {
        id: response.data.tenant.id,
        adminToken: response.data.accessToken,
      };

      console.log(chalk.green(`  ✓ Created tenant: ${tenant.name}`));
    } catch (error) {
      console.log(
        chalk.red(
          `  ✗ Failed to create tenant ${tenant.name}: ${error.message}`,
        ),
      );
    }
  }
}

// Step 2: Create Organisations
async function createOrganisations() {
  console.log(chalk.blue("\n🏢 Creating Organisations..."));
  const organisations = await readJsonFile("organisations.json");

  for (const org of organisations) {
    try {
      const tenantData = createdData.tenants[org.tenantSubdomain];
      if (!tenantData) {
        console.log(
          chalk.yellow(
            `  ⚠ Tenant ${org.tenantSubdomain} not found, skipping org ${org.name}`,
          ),
        );
        continue;
      }

      const response = await apiCall(
        "POST",
        "/organisations",
        {
          name: org.name,
          code: org.code,
          address: org.address,
          city: org.city,
          state: org.state,
          country: org.country,
          zipCode: org.zipCode,
          phone: org.phone,
          email: org.email,
        },
        org.tenantSubdomain,
      );

      const key = `${org.tenantSubdomain}-${org.code}`;
      createdData.organisations[key] = {
        id: response.data.id,
        tenantSubdomain: org.tenantSubdomain,
      };

      console.log(chalk.green(`  ✓ Created organisation: ${org.name}`));
    } catch (error) {
      console.log(
        chalk.red(
          `  ✗ Failed to create organisation ${org.name}: ${error.message}`,
        ),
      );
    }
  }
}

// Step 3: Create Departments
async function createDepartments() {
  console.log(chalk.blue("\n📂 Creating Departments..."));
  const departments = await readJsonFile("departments.json");

  for (const dept of departments) {
    try {
      const orgKey = `${dept.tenantSubdomain}-${dept.organisationCode}`;
      const orgData = createdData.organisations[orgKey];

      if (!orgData) {
        console.log(
          chalk.yellow(
            `  ⚠ Organisation ${orgKey} not found, skipping dept ${dept.name}`,
          ),
        );
        continue;
      }

      const response = await apiCall(
        "POST",
        "/departments",
        {
          organisationId: orgData.id,
          name: dept.name,
          code: dept.code,
          description: dept.description,
        },
        dept.tenantSubdomain,
      );

      const key = `${dept.tenantSubdomain}-${dept.code}`;
      createdData.departments[key] = {
        id: response.data.id,
        tenantSubdomain: dept.tenantSubdomain,
      };

      console.log(chalk.green(`  ✓ Created department: ${dept.name}`));
    } catch (error) {
      console.log(
        chalk.red(
          `  ✗ Failed to create department ${dept.name}: ${error.message}`,
        ),
      );
    }
  }
}

// Step 4: Create Designations
async function createDesignations() {
  console.log(chalk.blue("\n🎯 Creating Designations..."));
  const designations = await readJsonFile("designations.json");

  for (const desig of designations) {
    try {
      // Find the department this designation belongs to
      let deptData = null;
      let tenantSubdomain = null;

      for (const [key, data] of Object.entries(createdData.departments)) {
        if (key.endsWith(`-${desig.departmentCode}`)) {
          deptData = data;
          tenantSubdomain = data.tenantSubdomain;
          break;
        }
      }

      if (!deptData) {
        console.log(
          chalk.yellow(
            `  ⚠ Department ${desig.departmentCode} not found, skipping designation ${desig.name}`,
          ),
        );
        continue;
      }

      const response = await apiCall(
        "POST",
        "/designations",
        {
          departmentId: deptData.id,
          name: desig.name,
          code: desig.code,
          level: desig.level,
        },
        tenantSubdomain,
      );

      const key = `${tenantSubdomain}-${desig.code}`;
      createdData.designations[key] = {
        id: response.data.id,
        tenantSubdomain: tenantSubdomain,
      };

      console.log(chalk.green(`  ✓ Created designation: ${desig.name}`));
    } catch (error) {
      console.log(
        chalk.red(
          `  ✗ Failed to create designation ${desig.name}: ${error.message}`,
        ),
      );
    }
  }
}

// Step 5: Create Employees
async function createEmployees() {
  console.log(chalk.blue("\n👥 Creating Employees..."));
  const employees = await readJsonFile("employees.json");

  for (const emp of employees) {
    try {
      const orgKey = `${emp.tenantSubdomain}-${emp.organisationCode}`;
      const orgData = createdData.organisations[orgKey];
      const deptKey = `${emp.tenantSubdomain}-${emp.departmentCode}`;
      const deptData = createdData.departments[deptKey];
      const desigKey = `${emp.tenantSubdomain}-${emp.designationCode}`;
      const desigData = createdData.designations[desigKey];

      if (!orgData || !deptData || !desigData) {
        console.log(
          chalk.yellow(
            `  ⚠ Missing org/dept/designation for ${emp.firstName} ${emp.lastName}, skipping`,
          ),
        );
        continue;
      }

      const response = await apiCall(
        "POST",
        "/employees",
        {
          organisationId: orgData.id,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          dateOfBirth: emp.dateOfBirth,
          gender: emp.gender,
          maritalStatus: emp.maritalStatus,
          bloodGroup: emp.bloodGroup,
          dateOfJoining: emp.dateOfJoining,
          departmentId: deptData.id,
          designationId: desigData.id,
          employmentType: emp.employmentType,
          currentAddress: emp.currentAddress,
          city: emp.city,
          state: emp.state,
          country: emp.country,
          zipCode: emp.zipCode,
          password: defaultPassword,
        },
        emp.tenantSubdomain,
      );

      // Update user role if needed
      if (emp.role && emp.role !== "EMPLOYEE") {
        const userId = response.data.userId;
        try {
          await apiCall(
            "PUT",
            `/super-admin/users/${userId}`,
            {
              role: emp.role,
            },
            emp.tenantSubdomain,
          );
        } catch (roleError) {
          console.log(
            chalk.yellow(
              `  ⚠ Could not update role for ${emp.firstName}, continuing...`,
            ),
          );
        }
      }

      createdData.employees[emp.employeeCode] = response.data.id;

      console.log(
        chalk.green(
          `  ✓ Created employee: ${emp.firstName} ${emp.lastName} (${emp.employeeCode})`,
        ),
      );
    } catch (error) {
      console.log(
        chalk.red(
          `  ✗ Failed to create employee ${emp.firstName} ${emp.lastName}: ${error.message}`,
        ),
      );
    }
  }
}

// Main execution
async function main() {
  console.log(chalk.bold.cyan("\n🚀 Starting HRMS Dummy Data Population\n"));
  console.log(chalk.gray(`API Base URL: ${apiBaseUrl}`));
  console.log(chalk.gray(`Default Password: ${defaultPassword}\n`));

  try {
    await createTenants();
    await createOrganisations();
    await createDepartments();
    await createDesignations();
    await createEmployees();

    console.log(chalk.bold.green("\n✅ Dummy data population completed!"));
    console.log(chalk.cyan("\n📊 Summary:"));
    console.log(
      chalk.white(`  Tenants: ${Object.keys(createdData.tenants).length}`),
    );
    console.log(
      chalk.white(
        `  Organisations: ${Object.keys(createdData.organisations).length}`,
      ),
    );
    console.log(
      chalk.white(
        `  Departments: ${Object.keys(createdData.departments).length}`,
      ),
    );
    console.log(
      chalk.white(
        `  Designations: ${Object.keys(createdData.designations).length}`,
      ),
    );
    console.log(
      chalk.white(`  Employees: ${Object.keys(createdData.employees).length}`),
    );

    console.log(chalk.cyan("\n🔑 Login Credentials:"));
    console.log(
      chalk.white("  TechCorp Admin: admin@techcorp.com / Admin@123"),
    );
    console.log(
      chalk.white("  DesignHub Admin: admin@designhub.com / Admin@123"),
    );
    console.log(chalk.white(`  All Employees: <email> / ${defaultPassword}`));
  } catch (error) {
    console.log(chalk.bold.red("\n❌ Population failed:"), error.message);
    process.exit(1);
  }
}

main();
