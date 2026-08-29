import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, User } from 'lucide-react';
import userService from '../../services/userService.js';
import { useToast } from '../../components/Toast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, ToastContainer } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const loadUsers = () => {
    setLoading(true);
    userService.getAll()
      .then(data => setUsers(data.users || []))
      .catch(err => showToast(err.response?.data?.error || 'Erreur lors du chargement des utilisateurs', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        showToast('Utilisateur modifié avec succès', 'success');
      } else {
        await userService.create(formData);
        showToast('Utilisateur créé avec succès', 'success');
      }
      closeModal();
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${name}" ?`)) return;
    
    try {
      await userService.delete(id);
      showToast('Utilisateur supprimé avec succès', 'success');
      loadUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les accès à l'administration</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Rôle</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <LoadingSpinner size="md" className="mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.role === 'superadmin' ? (
                        <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <Shield className="w-3 h-3" /> SuperAdmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-medium">
                          <User className="w-3 h-3" /> Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulaire */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {editingUser && <span className="text-gray-400 font-normal">(laisser vide pour ne pas modifier)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="admin">Administrateur (Gestion boutique)</option>
                  <option value="superadmin">Super Administrateur (Accès total)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
