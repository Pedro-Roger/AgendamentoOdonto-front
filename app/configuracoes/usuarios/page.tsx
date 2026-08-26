"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { ConfigTabs } from "@/components/ConfigTabs";
import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  Shield,
  ShieldCheck,
  Users as UsersIcon,
  Lock,
  Unlock,
  Pencil,
} from "lucide-react";
import { adminApi, type UserAdminDto } from "@/src/lib/frontend-api";

type Role = "MASTER" | "ADMIN" | "DENTISTA" | "RECEPCIONISTA";

const roleLabel: Record<Role, string> = {
  MASTER: "Master",
  ADMIN: "Administradora",
  DENTISTA: "Dentista",
  RECEPCIONISTA: "Recepcionista",
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserAdminDto[] | null>(null);
  const [me, setMe] = useState<{ id: string; role: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<UserAdminDto | null>(null);

  const existingEmails = useMemo(
    () => new Set((users ?? []).map((u) => u.email.toLowerCase())),
    [users]
  );

  async function refresh() {
    try {
      const list = await adminApi.listUsers();
      setUsers(list);
    } catch (e: any) {
      setLoadError(e?.message ?? "Erro ao carregar usuários");
      setUsers([]);
    }
  }

  useEffect(() => {
    fetch("/api/session/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setMe(d.user ? { id: d.user.id, role: d.user.role } : null))
      .catch(() => setMe(null));
    refresh();
  }, []);

  async function toggleActive(u: UserAdminDto) {
    try {
      await adminApi.updateUser(u.id, { isActive: !u.isActive });
      await refresh();
    } catch (e: any) {
      setLoadError(e?.message ?? "Erro ao alterar status");
    }
  }

  if (me && me.role !== "MASTER") {
    return (
      <AppShell>
        <Topbar title="Acesso negado" subtitle="Somente perfil Master" />
        <div className="bg-white border border-sage-100 rounded-3xl p-10 text-center">
          <Shield size={32} className="mx-auto text-rose-400 mb-3" />
          <p className="text-sm text-ink-500">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar
        title="Configurações"
        subtitle="Gerencie usuários e permissões da clínica"
        actionSlot={
          <button
            onClick={() => setOpenNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 transition-colors shadow-soft"
          >
            <Plus size={16} strokeWidth={2.4} />
            Novo usuário
          </button>
        }
      />
      <ConfigTabs />

      {loadError && (
        <div role="alert" className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-rose-100 border border-rose-200 text-rose-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="bg-white border border-sage-100 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-sage-100">
          <h2 className="font-display text-xl text-ink-700">Usuários da clínica</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            {users
              ? `${users.filter((u) => u.isActive).length} ativos de ${users.length} cadastrados`
              : "Carregando…"}
          </p>
        </div>

        {users && users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mb-4">
              <UsersIcon size={24} />
            </div>
            <p className="text-sm text-ink-500 max-w-sm mx-auto">
              Nenhum usuário cadastrado. Clique em{" "}
              <span className="font-medium text-ink-700">Novo usuário</span> para começar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left text-xs text-ink-400 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">E-mail</th>
                <th className="px-6 py-3 font-medium">Perfil</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium w-40">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => {
                const isSelf = me?.id === u.id;
                return (
                  <tr
                    key={u.id}
                    className="border-t border-sage-100 hover:bg-cream-100/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            u.role === "MASTER"
                              ? "bg-peach-200 text-peach-600"
                              : "bg-sage-200 text-sage-600"
                          }`}
                        >
                          {u.name.split(" ").slice(0, 2).map((s) => s[0]?.toUpperCase()).join("")}
                        </span>
                        <span className="text-sm font-medium text-ink-700">
                          {u.name}
                          {isSelf && <span className="ml-2 text-xs text-ink-400">(você)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                          u.role === "MASTER"
                            ? "bg-peach-100 text-peach-600"
                            : "bg-sage-100 text-sage-600"
                        }`}
                      >
                        {u.role === "MASTER" ? <ShieldCheck size={12} /> : <Shield size={12} />}
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full ${
                          u.isActive
                            ? "bg-sage-100 text-sage-600"
                            : "bg-rose-100 text-rose-400"
                        }`}
                      >
                        {u.isActive ? "Ativo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(u)}
                          aria-label={`Editar ${u.name}`}
                          className="w-8 h-8 rounded-lg hover:bg-cream-200 flex items-center justify-center text-ink-500 hover:text-ink-700"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          disabled={isSelf}
                          onClick={() => toggleActive(u)}
                          aria-label={u.isActive ? `Bloquear ${u.name}` : `Liberar ${u.name}`}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed ${
                            u.isActive
                              ? "hover:bg-rose-100 text-ink-500 hover:text-rose-400"
                              : "hover:bg-sage-100 text-ink-500 hover:text-sage-600"
                          }`}
                        >
                          {u.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {openNew && (
        <UserModal
          mode="create"
          existingEmails={existingEmails}
          onClose={() => setOpenNew(false)}
          onSaved={async () => {
            setOpenNew(false);
            await refresh();
          }}
        />
      )}

      {editing && (
        <UserModal
          mode="edit"
          user={editing}
          existingEmails={existingEmails}
          selfId={me?.id ?? null}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </AppShell>
  );
}

function UserModal({
  mode,
  user,
  existingEmails,
  selfId,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  user?: UserAdminDto;
  existingEmails: Set<string>;
  selfId?: string | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "ADMIN");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = mode === "edit";
  const isSelf = isEdit && selfId === user?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) return setError("Informe o nome.");
    if (!trimmedEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      return setError("E-mail inválido.");
    }
    if (!isEdit && existingEmails.has(trimmedEmail)) {
      return setError("E-mail já cadastrado.");
    }
    if (isEdit && trimmedEmail !== user!.email && existingEmails.has(trimmedEmail)) {
      return setError("E-mail já cadastrado.");
    }
    if (!isEdit && password.length < 6) {
      return setError("Senha deve ter pelo menos 6 caracteres.");
    }
    if (isEdit && password && password.length < 6) {
      return setError("Senha deve ter pelo menos 6 caracteres.");
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const patch: any = { name: trimmedName, email: trimmedEmail, role, isActive };
        if (password) patch.password = password;
        await adminApi.updateUser(user!.id, patch);
      } else {
        await adminApi.createUser({ name: trimmedName, email: trimmedEmail, password, role });
      }
      await onSaved();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar usuário");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-700/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-sage-100">
          <h2 className="font-display text-2xl text-ink-700">
            {isEdit ? "Editar usuário" : "Novo usuário"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full hover:bg-cream-100 flex items-center justify-center text-ink-500"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="u-name" className="block text-xs font-medium text-ink-500 mb-1.5">
              Nome
            </label>
            <input
              id="u-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="u-email" className="block text-xs font-medium text-ink-500 mb-1.5">
              E-mail
            </label>
            <input
              id="u-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="u-password" className="block text-xs font-medium text-ink-500 mb-1.5">
              {isEdit ? "Nova senha (deixe vazio para manter)" : "Senha"}
            </label>
            <input
              id="u-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white"
              placeholder={isEdit ? "••••••" : "Mínimo 6 caracteres"}
            />
          </div>
          <div>
            <label htmlFor="u-role" className="block text-xs font-medium text-ink-500 mb-1.5">
              Perfil
            </label>
            <select
              id="u-role"
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-sage-100 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:bg-white disabled:opacity-60"
            >
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="DENTISTA">Dentista</option>
              <option value="ADMIN">Administradora</option>
              <option value="MASTER">Master</option>
            </select>
            {isSelf && (
              <p className="text-[11px] text-ink-400 mt-1">Não é possível alterar o próprio perfil.</p>
            )}
            {role === "DENTISTA" && !isEdit && (
              <p className="text-[11px] text-ink-400 mt-1">
                Cada dentista tem consultório próprio: a conta é criada em uma Compania separada, com
                agenda e pacientes só dela, e entra como Master para poder cadastrar a própria equipe —
                por isso não aparece nesta lista depois de salva.
              </p>
            )}
          </div>
          {isEdit && (
            <div className="flex items-center gap-3">
              <input
                id="u-active"
                type="checkbox"
                checked={isActive}
                disabled={isSelf}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="u-active" className="text-sm text-ink-600">
                Conta ativa (pode fazer login)
              </label>
            </div>
          )}

          {error && (
            <div role="alert" className="text-xs text-rose-400 bg-rose-100 rounded-2xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-sm text-ink-500 hover:bg-cream-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-sage-400 text-white hover:bg-sage-500 disabled:opacity-50 shadow-soft inline-flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
