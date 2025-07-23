import React, { useState } from 'react';
import Card from '../../ui/Card';
import Loading from '../../ui/Loading';
import Error from '../../ui/Error';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import CreatePlayerForm from './CreatePlayerForm';
import EditPlayerForm from './EditPlayerForm';
import PlayerActions from './PlayerActions';
import PlayerFilters from './PlayerFilters';
import PlayerTable from './PlayerTable';
import PlayerPagination from './PlayerPagination';
import { useAdminPlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer } from '../../../services/graphql/players';
import { Player } from '../../../types';

interface PlayerManagementProps {}

const PlayerManagement: React.FC<PlayerManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [filterSex, setFilterSex] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWaiverStatus, setFilterWaiverStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: playersData, loading, error, refetch } = useAdminPlayers();
  const [createPlayer, { loading: creating }] = useCreatePlayer();
  const [updatePlayer, { loading: updating }] = useUpdatePlayer();
  const [deletePlayer, { loading: deleting }] = useDeletePlayer();

  const players = playersData?.adminPlayers?.nodes || [];

  // Enhanced filtering
  const filteredPlayers = players.filter((player: Player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSex = filterSex === 'all' || player.sex === filterSex;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'minor' && player.isMinor) ||
                         (filterStatus === 'adult' && !player.isMinor);
    const matchesWaiverStatus = filterWaiverStatus === 'all' ||
                               (filterWaiverStatus === 'signed' && player.waiverSigned) ||
                               (filterWaiverStatus === 'pending' && !player.waiverSigned);
    
    return matchesSearch && matchesSex && matchesStatus && matchesWaiverStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

  const handleCreatePlayer = () => {
    setShowCreateModal(true);
  };

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setShowEditModal(true);
  };

  const handleDeletePlayer = (player: Player) => {
    setSelectedPlayer(player);
    setShowDeleteModal(true);
  };

  const handleViewPlayer = (player: Player) => {
    // Navigate to player detail page (future feature)
    console.log('View player:', player.name);
  };

  const handleCreateSubmit = async (formData: any) => {
    try {
      await createPlayer({
        variables: { input: formData }
      });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!selectedPlayer) return;
    
    try {
      await updatePlayer({
        variables: { id: selectedPlayer.id, input: formData }
      });
      setShowEditModal(false);
      setSelectedPlayer(null);
      refetch();
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPlayer) return;
    
    try {
      await deletePlayer({
        variables: { id: selectedPlayer.id }
      });
      setShowDeleteModal(false);
      setSelectedPlayer(null);
      refetch();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterSex('all');
    setFilterStatus('all');
    setFilterWaiverStatus('all');
    setCurrentPage(1);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Player Management</h2>
          <p className="text-gray-600">Manage player profiles and information</p>
        </div>
        <PlayerActions onCreatePlayer={handleCreatePlayer} />
      </div>

      {/* Filters */}
      <PlayerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterSex={filterSex}
        onSexChange={setFilterSex}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterWaiverStatus={filterWaiverStatus}
        onWaiverStatusChange={setFilterWaiverStatus}
        onResetFilters={resetFilters}
        filteredCount={filteredPlayers.length}
        totalCount={players.length}
      />

      {/* Table */}
      <PlayerTable
        players={paginatedPlayers}
        onViewPlayer={handleViewPlayer}
        onEditPlayer={handleEditPlayer}
        onDeletePlayer={handleDeletePlayer}
      />

      {/* Pagination */}
      <PlayerPagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={filteredPlayers.length}
        onPageChange={setCurrentPage}
      />

      {/* Create Player Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Player"
        size="lg"
      >
        <CreatePlayerForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isLoading={creating}
        />
      </Modal>

      {/* Edit Player Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Player"
        size="lg"
      >
        {selectedPlayer && (
          <EditPlayerForm
            player={selectedPlayer}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditModal(false)}
            isLoading={updating}
          />
        )}
      </Modal>

      {/* Delete Player Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Player"
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{selectedPlayer?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => setShowDeleteModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlayerManagement;