import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  patientQueryKeys,
} from '@/services/patient-service'
import { Patient, PatientFormValues } from '@/lib/schemas/patient-schema'

// Hook para listar todos os pacientes
export function usePatients() {
  return useQuery({
    queryKey: patientQueryKeys.lists(),
    queryFn: getAllPatients,
  })
}

// Hook para buscar um paciente por ID
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientQueryKeys.detail(id),
    queryFn: () => getPatientById(id),
    enabled: !!id,
  })
}

// Hook para criar um novo paciente
export function useCreatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      // Invalidar a lista de pacientes para refetch
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.lists(),
      })
      toast.success('Paciente criado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar paciente: ${error.message}`)
    },
  })
}

// Hook para atualizar um paciente
export function useUpdatePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientFormValues }) =>
      updatePatient(id, data),
    onSuccess: (updatedPatient) => {
      // Invalidar a lista de pacientes
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.lists(),
      })
      
      // Atualizar o cache do paciente específico
      queryClient.setQueryData(
        patientQueryKeys.detail(updatedPatient.id),
        updatedPatient
      )
      toast.success('Paciente atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar paciente: ${error.message}`)
    },
  })
}

// Hook para excluir um paciente
export function useDeletePatient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePatient,
    onSuccess: (_, deletedId) => {
      // Invalidar a lista de pacientes
      queryClient.invalidateQueries({
        queryKey: patientQueryKeys.lists(),
      })
      
      // Remover o paciente específico do cache
      queryClient.removeQueries({
        queryKey: patientQueryKeys.detail(deletedId),
      })
      toast.success('Paciente excluído com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao excluir paciente: ${error.message}`)
    },
  })
}
