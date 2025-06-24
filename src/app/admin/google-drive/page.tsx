import { ProtectedPage } from '@/components/protected-page'
import GoogleDriveManager from '@/components/google-drive-manager'

export default function GoogleDrivePage() {
  return (
    <ProtectedPage>
      <div className="container mx-auto py-6">
        <GoogleDriveManager />
      </div>
    </ProtectedPage>
  )
} 