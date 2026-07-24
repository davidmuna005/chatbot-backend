export const createSchoolRegistry = () => {
  const schools = new Map();

  return {
    registerSchool(school) {
      schools.set(school.id, {
        ...school,
        createdAt: school.createdAt || new Date().toISOString(),
        updatedAt: school.updatedAt || new Date().toISOString(),
        webhookStatus: school.webhookStatus || 'enabled',
        heartbeat: school.heartbeat || 'unknown',
        deploymentVersion: school.deploymentVersion || '1.0.0'
      });
      return schools.get(school.id);
    },

    findSchool(schoolId) {
      return schools.get(schoolId) || null;
    },

    listSchools() {
      return Array.from(schools.values());
    },

    updateSchool(schoolId, updates) {
      const existing = schools.get(schoolId);
      if (!existing) {
        return null;
      }
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      schools.set(schoolId, updated);
      return updated;
    },

    removeSchool(schoolId) {
      const existing = schools.get(schoolId);
      if (!existing) {
        return false;
      }
      schools.delete(schoolId);
      return true;
    }
  };
};

export default createSchoolRegistry;
