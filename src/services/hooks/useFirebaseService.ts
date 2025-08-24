import { useEffect, useState } from 'react'
import { ServiceManager, ServiceType } from '../ServiceManager'
import { FirebaseService } from '../firebase/FirebaseService'
import { Student, Performance, StudySession } from '../../types/services'

// Hook personalizado para usar o Firebase Service
export const useFirebaseService = () => {
  const [firebaseService, setFirebaseService] = useState<FirebaseService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeService = async () => {
      try {
        const serviceManager = ServiceManager.getInstance()
        const service = serviceManager.getService<FirebaseService>(ServiceType.FIREBASE)
        
        if (service) {
          setFirebaseService(service)
        } else {
          setError('Firebase service not registered')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    initializeService()
  }, [])

  return {
    firebaseService,
    isLoading,
    error,
  }
}

// Hook para gerenciar dados de estudante
export const useStudent = (studentId: string) => {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { firebaseService } = useFirebaseService()

  useEffect(() => {
    const fetchStudent = async () => {
      if (!firebaseService || !studentId) return

      try {
        setIsLoading(true)
        const response = await firebaseService.getStudent(studentId)
        
        if (response.success) {
          setStudent(response.data)
          setError(null)
        } else {
          setError(response.error || 'Failed to fetch student')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [firebaseService, studentId])

  return {
    student,
    isLoading,
    error,
    refetch: () => {
      if (firebaseService && studentId) {
        setIsLoading(true)
        firebaseService.getStudent(studentId).then(response => {
          if (response.success) {
            setStudent(response.data)
            setError(null)
          } else {
            setError(response.error || 'Failed to fetch student')
          }
          setIsLoading(false)
        })
      }
    },
  }
}

// Hook para gerenciar dados de performance
export const usePerformance = (studentId: string) => {
  const [performance, setPerformance] = useState<Performance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { firebaseService } = useFirebaseService()

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!firebaseService || !studentId) return

      try {
        setIsLoading(true)
        const response = await firebaseService.getStudentPerformance(studentId)
        
        if (response.success) {
          setPerformance(response.data)
          setError(null)
        } else {
          setError(response.error || 'Failed to fetch performance')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformance()
  }, [firebaseService, studentId])

  return {
    performance,
    isLoading,
    error,
  }
}

// Hook para gerenciar sessões de estudo
export const useStudySessions = (studentId: string) => {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { firebaseService } = useFirebaseService()

  useEffect(() => {
    const fetchSessions = async () => {
      if (!firebaseService || !studentId) return

      try {
        setIsLoading(true)
        const response = await firebaseService.getStudySessions(studentId)
        
        if (response.success) {
          setSessions(response.data)
          setError(null)
        } else {
          setError(response.error || 'Failed to fetch study sessions')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [firebaseService, studentId])

  return {
    sessions,
    isLoading,
    error,
  }
}
