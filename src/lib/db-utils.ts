import { db } from './db'
import { 
  professionalsTable,
  patientsTable,
  guardiansTable,
  healthPlansTable,
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
    return await db.select().from(professionalsTable)
  },

  async getById(id: string): Promise<Professional | undefined> {
    const result = await db.select().from(professionalsTable).where(eq(professionalsTable.id, id))
    return result[0]
  },

  async create(data: NewProfessional): Promise<Professional> {
    const result = await db.insert(professionalsTable).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewProfessional>): Promise<Professional | undefined> {
    const result = await db.update(professionalsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(professionalsTable.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(professionalsTable).where(eq(professionalsTable.id, id))
  }
}

// Guardian operations
export const guardianOperations = {
  async getAll(): Promise<Guardian[]> {
    return await db.select().from(guardiansTable)
  },

  async getById(id: string): Promise<Guardian | undefined> {
    const result = await db.select().from(guardiansTable).where(eq(guardiansTable.id, id))
    return result[0]
  },

  async create(data: NewGuardian): Promise<Guardian> {
    const result = await db.insert(guardiansTable).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewGuardian>): Promise<Guardian | undefined> {
    const result = await db.update(guardiansTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(guardiansTable.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(guardiansTable).where(eq(guardiansTable.id, id))
  }
}

// Health Plan operations
export const healthPlanOperations = {
  async getAll(): Promise<HealthPlan[]> {
    return await db.select().from(healthPlansTable)
  },

  async getById(id: string): Promise<HealthPlan | undefined> {
    const result = await db.select().from(healthPlansTable).where(eq(healthPlansTable.id, id))
    return result[0]
  },

  async create(data: NewHealthPlan): Promise<HealthPlan> {
    const result = await db.insert(healthPlansTable).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewHealthPlan>): Promise<HealthPlan | undefined> {
    const result = await db.update(healthPlansTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(healthPlansTable.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(healthPlansTable).where(eq(healthPlansTable.id, id))
  }
}

// Patient operations
export const patientOperations = {
  async getAll(): Promise<Patient[]> {
    return await db.select().from(patientsTable)
  },

  async getById(id: string): Promise<Patient | undefined> {
    const result = await db.select().from(patientsTable).where(eq(patientsTable.id, id))
    return result[0]
  },

  async create(data: NewPatient): Promise<Patient> {
    const result = await db.insert(patientsTable).values(data).returning()
    return result[0]
  },

  async update(id: string, data: Partial<NewPatient>): Promise<Patient | undefined> {
    const result = await db.update(patientsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patientsTable.id, id))
      .returning()
    return result[0]
  },

  async delete(id: string): Promise<void> {
    await db.delete(patientsTable).where(eq(patientsTable.id, id))
  }
}
