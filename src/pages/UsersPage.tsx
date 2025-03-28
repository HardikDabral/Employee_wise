
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import UserCard from '@/components/UserCard';
import UserEditModal from '@/components/UserEditModal';
import UserDeleteDialog from '@/components/UserDeleteDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, UserResponse, UpdateUserData } from '@/types';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '@/components/Footer';

const UsersPage: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State to store all users
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const fetchUsers = async (page: number, isSearching: boolean = false) => {
    setLoading(true);
    try {
      if (isSearching) {
        // Fetch all pages when searching
        const allPagesData: User[] = [];
        const firstPageResponse = await fetch(`https://reqres.in/api/users?page=1`);
        const firstPageData: UserResponse = await firstPageResponse.json();
        const totalPages = firstPageData.total_pages;
        
        allPagesData.push(...firstPageData.data);
        
        // Fetch remaining pages
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
        const remainingPagesData = await Promise.all(
          remainingPages.map(pageNum =>
            fetch(`https://reqres.in/api/users?page=${pageNum}`)
              .then(res => res.json())
              .then((data: UserResponse) => data.data)
          )
        );
        
        remainingPagesData.forEach(pageData => {
          allPagesData.push(...pageData);
        });
        
        setAllUsers(allPagesData);
        return allPagesData;
      } else {
        // Normal page fetch
        const response = await fetch(`https://reqres.in/api/users?page=${page}`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data: UserResponse = await response.json();
        setUsers(data.data);
        setFilteredUsers(data.data);
        setTotalPages(data.total_pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Modify search effect to use all users
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      // Fetch all users if not already fetched
      if (allUsers.length === 0) {
        fetchUsers(1, true).then(allUsersData => {
          const filtered = allUsersData.filter(
            (user) =>
              user.first_name.toLowerCase().includes(query) ||
              user.last_name.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query)
          );
          setFilteredUsers(filtered);
        });
      } else {
        const filtered = allUsers.filter(
          (user) =>
            user.first_name.toLowerCase().includes(query) ||
            user.last_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
        setFilteredUsers(filtered);
      }
    }
  }, [searchQuery, users, allUsers]);
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Filter users based on search query
  // Remove the duplicate useEffect for search and keep only this one
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim() === '') {
        setFilteredUsers(users);
        return;
      }

      setLoading(true);
      try {
        // Fetch all users for search
        const response = await fetch(`https://reqres.in/api/users?per_page=12`);
        const data: UserResponse = await response.json();
        
        const query = searchQuery.toLowerCase();
        const filtered = data.data.filter(
          (user) =>
            user.first_name.toLowerCase().includes(query) ||
            user.last_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
        
        setFilteredUsers(filtered);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [searchQuery]);

  // Keep the regular page fetch separate
  useEffect(() => {
    if (!searchQuery) {
      fetchUsers(currentPage);
    }
  }, [currentPage]);

  // Edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const saveUserChanges = async (id: number, userData: UpdateUserData) => {
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update both users and filteredUsers states
      const updateUserData = (prevUsers: User[]) =>
        prevUsers.map((user) =>
          user.id === id
            ? {
                ...user,
                first_name: userData.first_name || user.first_name,
                last_name: userData.last_name || user.last_name,
                email: userData.email || user.email,
              }
            : user
        );

      setUsers(updateUserData);
      setFilteredUsers(updateUserData);
      setAllUsers(updateUserData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Delete user
  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`https://reqres.in/api/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Update both users and filteredUsers states
      const filterUserData = (prevUsers: User[]) => 
        prevUsers.filter((user) => user.id !== deletingUser.id);

      setUsers(filterUserData);
      setFilteredUsers(filterUserData);
      setAllUsers(filterUserData);
      setIsDeleteDialogOpen(false);
      
      toast.success(`${deletingUser.first_name} ${deletingUser.last_name} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="page-container px-6 py-12 max-w-7xl mx-auto">
          <div className="mb-12 relative">
            <div className="absolute -left-4 top-0 w-1 h-12 bg-gradient-to-b from-primary to-purple-500"></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 font-outfit text-foreground">
              User Management
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-jakarta leading-relaxed">
              View, edit, and manage your team members with ease
            </p>
          </div>

          {/* Search and pagination controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 sm:mb-8">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-jakarta text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 font-jakarta">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1 || loading}
                className="hover:bg-primary/5 transition-colors text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || loading}
                className="hover:bg-primary/5 transition-colors text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border">
              <p className="text-muted-foreground font-jakarta text-lg">No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <UserEditModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={saveUserChanges}
        />

        {/* Delete Confirmation Dialog */}
        <UserDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDeleteUser}
          userName={deletingUser ? `${deletingUser.first_name} ${deletingUser.last_name}` : ''}
        />
      </div>
      <Footer />
    </div>
);
};

export default UsersPage;
