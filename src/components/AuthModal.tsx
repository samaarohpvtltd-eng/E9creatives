import React, { useState } from 'react';
import { UserAccount, AccountCredential, Designation } from '../types.ts';
import { ACCOUNTS_DATABASE, authenticateUser } from '../data/authData.ts';
import {
  X,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  isSwitchMode?: boolean;
  accounts?: AccountCredential[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  isSwitchMode = false,
  accounts = ACCOUNTS_DATABASE,
}) => {
  const activeAccounts = accounts && accounts.length > 0 ? accounts : ACCOUNTS_DATABASE;
  const [selectedDesignation, setSelectedDesignation] = useState<Designation>(
    currentUser ? currentUser.designation : 'admin'
  );
  const [emailInput, setEmailInput] = useState<string>('admin@e9graphics.com');
  const [passwordInput, setPasswordInput] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectQuickAccount = (acct: AccountCredential) => {
    setSelectedDesignation(acct.designation);
    setEmailInput(acct.email);
    setPasswordInput(acct.passwordHash);
    setErrorMsg(null);
  };

  const handleQuickLoginDirect = (acct: AccountCredential) => {
    onLogin(acct);
    if (onClose) onClose();
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const user = authenticateUser(emailInput, passwordInput, activeAccounts);
    if (user) {
      onLogin(user);
      if (onClose) onClose();
    } else {
      setErrorMsg('Invalid corporate email or password. Select an operator row above or verify credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-5 my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-mono font-bold text-xs">
              E9
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                {isSwitchMode ? 'Operator Directory & Role Switcher' : 'E9 Enterprise Operations Sign-In'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Select an authorized staff profile or enter corporate credentials to switch departmental clearance.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Staff Directory Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Authorized Personnel Directory</span>
            <span className="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">{activeAccounts.length} Active Accounts</span>
          </div>

          <div className="border border-slate-200 dark:border-zinc-800 rounded-md divide-y divide-slate-200 dark:divide-zinc-800 overflow-hidden">
            {activeAccounts.map((acct) => {
              const isCurrent = currentUser?.id === acct.id;
              const isSelected = selectedDesignation === acct.designation && emailInput === acct.email;

              return (
                <div
                  key={acct.id}
                  onClick={() => handleSelectQuickAccount(acct)}
                  className={`p-3 flex items-center justify-between gap-4 cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-100/90 dark:bg-zinc-800/80'
                      : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-mono font-semibold text-xs shrink-0">
                      {acct.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate">
                          {acct.name}
                        </p>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">·</span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                          {acct.designationTitle}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                            [Current]
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                        <span>{acct.email}</span>
                        <span>·</span>
                        <span className="tabular-nums">{acct.allowedRoles.length} assigned modules</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLoginDirect(acct);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Switch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Credentials Entry Form */}
        <form onSubmit={handleSubmitForm} className="p-4 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Direct Credential Sign-In</span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 text-[11px] font-medium">Corporate Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 text-[11px] font-medium">Access Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 pr-8 rounded bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-200 text-xs focus:outline-none focus:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs rounded transition cursor-pointer"
          >
            Authenticate Operator Session
          </button>
        </form>
      </div>
    </div>
  );
};
