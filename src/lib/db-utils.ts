import { db } from './db'
import { 
  professionals, 
  patients, 
  guardians, 
  healthPlans,
  type Professional,
  type Patient,
  type Guardian,
  type HealthPlan,
  type NewProfessional,
  type NewPatient,
  type NewGuardian,
  type NewHealthPlan
} from './schemas'
import { eq } from 'drizzle-orm'

// Professional operations
export const professionalOperations = {
  async getAll(): Promise<Professional[]> {
    return await db.select().from(professionals)
  },

  async getById(id: string): Promise<Professional | undefined> {
    const result = await db.select().from(professionals).where(eq(professionals.id, id))
    return result[0]
  },

  async create(data: NewProfessional): Promise<Professional> {
    const result = await db.insert(professionals).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewProfessional>): Promise<Professional | undefined> {
    const result = await db.update(professionals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(professionals.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(professionals).where(eq(professionals.id, id))
  }
}

// Guardian operations
export const guardianOperations = {
  async getAll(): Promise<Guardian[]> {
    return await db.select().from(guardians)
  },

  async getById(id: string): Promise<Guardian | undefined> {
    const result = await db.select().from(guardians).where(eq(guardians.id, id))
    return result[0]
  },

  async create(data: NewGuardian): Promise<Guardian> {
    const result = await db.insert(guardians).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewGuardian>): Promise<Guardian | undefined> {
    const result = await db.update(guardians)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(guardians.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(guardians).where(eq(guardians.id, id))
  }
}

// Health Plan operations
export const healthPlanOperations = {
  async getAll(): Promise<HealthPlan[]> {
    return await db.select().from(healthPlans)
  },

  async getById(id: string): Promise<HealthPlan | undefined> {
    const result = await db.select().from(healthPlans).where(eq(healthPlans.id, id))
    return result[0]
  },

  async create(data: NewHealthPlan): Promise<HealthPlan> {
    const result = await db.insert(healthPlans).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewHealthPlan>): Promise<HealthPlan | undefined> {
    const result = await db.update(healthPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(healthPlans.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(healthPlans).where(eq(healthPlans.id, id))
  }
}

// Patient operations
export const patientOperations = {
  async getAll(): Promise<Patient[]> {
    return await db.select().from(patients)
  },

  async getById(id: string): Promise<Patient | undefined> {
    const result = await db.select().from(patients).where(eq(patients.id, id))
    return result[0]
  },

  async create(data: NewPatient): Promise<Patient> {
    const result = await db.insert(patients).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewPatient>): Promise<Patient | undefined> {
    const result = await db.update(patients)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(patients).where(eq(patients.id, id))
  }
}
