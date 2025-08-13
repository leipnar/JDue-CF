import React, { useState } from 'react';
import { User } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import Icon from './common/Icon';
import { useTranslation } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser, registerPasskey } = useData();
  const user = currentUser as User; // We can assert this as modal is only open for a logged in user

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState('');
  const { t } = useTranslation();

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setPasskeyStatus('');
    setEmail(user.email);
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsUpdating(true);

    try {
        if (newPassword.length < 6) {
          throw new Error(t('profileModal.error.passwordLength'));
        }
        if (newPassword !== confirmPassword) {
          throw new Error(t('profileModal.error.passwordMismatch'));
        }

        await updateUser({ currentPassword, newPassword });
        
        setSuccess(t('profileModal.success.password'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsUpdating(false);
    }
  };
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (email === user.email) return;
    if (!email.includes('@')) {
      setError(t('login.error.invalidEmail'));
      return;
    }

    setIsUpdating(true);
    try {
      await updateUser({ email });
      setSuccess(t('profileModal.success.email'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegisterPasskey = async () => {
      setPasskeyStatus(t('profileModal.passkey.registering'));
      setError('');
      setIsUpdating(true);
      try {
          // This is a browser API that triggers the OS/browser to create a new passkey.
          const newCredential = await navigator.credentials.create({
              publicKey: {
                  challenge: crypto.getRandomValues(new Uint8Array(32)),
                  rp: { 
                      name: "JDue",
                      id: window.location.hostname,
                  },
                  user: {
                      id: new TextEncoder().encode(user.id),
                      name: user.email,
                      displayName: user.username,
                  },
                  pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256
                  authenticatorSelection: {
                      userVerification: 'required',
                      residentKey: 'preferred',
                  },
                  timeout: 60000,
                  // We don't exclude credentials here to allow multiple passkeys per user
              }
          }) as PublicKeyCredential | null;

          if (newCredential) {
              // Send the full credential to the backend for verification and storage
              await registerPasskey(newCredential);
              setSuccess(t('profileModal.passkey.success'));
              setPasskeyStatus('');
          } else {
            setPasskeyStatus('');
          }
      } catch (err) {
          console.error("Passkey registration failed:", err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(t('profileModal.passkey.error', { error: errorMessage }));
          setPasskeyStatus('');
      } finally {
        setIsUpdating(false);
      }
  };

  const inputClasses = "mt-1 block w-full border bg-white dark:bg-slate-800 border-slate-300 dark:border-dark-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('profileModal.title', { username: user.username })}>
      <div className="space-y-6">
        
        {/* Email Section */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
           <fieldset disabled={isUpdating}>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-heading">{t('profileModal.email.title')}</h4>
              <div>
                <label className={labelClasses}>{t('profileModal.field.email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={email === user.email || !email.includes('@')}>{isUpdating ? '...' : t('profileModal.button.updateEmail')}</Button>
              </div>
           </fieldset>
        </form>

        <div className="border-t border-slate-200 dark:border-dark-border"></div>

        {/* Change Password Section */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <fieldset disabled={isUpdating}>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-heading">{t('profileModal.password.title')}</h4>
              <div>
                <label className={labelClasses}>{t('profileModal.field.currentPassword')}</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>{t('profileModal.field.newPassword')}</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>{t('profileModal.field.confirmNewPassword')}</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClasses} required />
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit">{isUpdating ? '...' : t('profileModal.button.updatePassword')}</Button>
              </div>
            </fieldset>
        </form>

        {error && <p className="text-sm text-red-500 pt-2 text-center">{error}</p>}
        {success && <p className="text-sm text-green-500 pt-2 text-center">{success}</p>}

        <div className="border-t border-slate-200 dark:border-dark-border"></div>

        {/* Passkeys Section */}
        {window.PublicKeyCredential && (
            <div className="space-y-4">
                <fieldset disabled={isUpdating}>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-heading">{t('profileModal.passkey.title')}</h4>
                {user.passkeys?.length > 0 ? (
                    <ul className="space-y-2">
                        {user.passkeys.map((key, index) => (
                            <li key={key.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                                <div className="flex items-center">
                                    <Icon name="passkey" className="w-5 h-5 text-indigo-500 mr-3" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('profileModal.passkey.registered', { index: (index + 1).toString() })}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('profileModal.passkey.none')}</p>
                )}

                {passkeyStatus && <p className="text-sm text-blue-500">{passkeyStatus}</p>}

                <div className="flex justify-start mt-4">
                    <Button type="button" variant="secondary" onClick={handleRegisterPasskey}>
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        {t('profileModal.passkey.registerButton')}
                    </Button>
                </div>
                </fieldset>
            </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-dark-border">
          <Button type="button" variant="secondary" onClick={handleClose}>{t('taskModal.button.close')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;