import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PLAYERS,
  GET_PLAYER,
  GET_BOOKINGS,
  GET_BOOKING,
  GET_REVIEWS,
  GET_REVIEW,
  GET_FAMILY_MEMBERS
} from '../../graphql/queries';
import {
  CREATE_BOOKING,
  DELETE_BOOKING,
  CREATE_REVIEW,
  UPDATE_REVIEW,
  DELETE_REVIEW
} from '../../graphql/mutations';

// Player Hooks
export const usePlayers = () => {
  return useQuery(GET_PLAYERS, {
    errorPolicy: 'all',
  });
};

export const usePlayer = (id: string) => {
  return useQuery(GET_PLAYER, {
    variables: { id },
    errorPolicy: 'all',
  });
};

// Booking Hooks
export const useBookings = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_BOOKINGS, {
    errorPolicy: 'all',
    skip: !token,
  });
};

export const useBooking = (id: string) => {
  return useQuery(GET_BOOKING, {
    variables: { id },
    errorPolicy: 'all',
  });
};

export const useCreateBooking = () => {
  return useMutation(CREATE_BOOKING, {
    refetchQueries: [
      { query: GET_BOOKINGS }
    ]
  });
};

export const useDeleteBooking = () => {
  return useMutation(DELETE_BOOKING, {
    refetchQueries: [
      { query: GET_BOOKINGS }
    ]
  });
};

// Review Hooks
export const useReviews = () => {
  return useQuery(GET_REVIEWS, {
    errorPolicy: 'all',
  });
};

export const useReview = (id: string) => {
  return useQuery(GET_REVIEW, {
    variables: { id },
    errorPolicy: 'all',
  });
};

export const useCreateReview = () => {
  return useMutation(CREATE_REVIEW, {
    refetchQueries: [
      { query: GET_REVIEWS }
    ]
  });
};

export const useUpdateReview = () => {
  return useMutation(UPDATE_REVIEW, {
    refetchQueries: [
      { query: GET_REVIEWS }
    ]
  });
};

export const useDeleteReview = () => {
  return useMutation(DELETE_REVIEW, {
    refetchQueries: [
      { query: GET_REVIEWS }
    ]
  });
};

// Family Hooks
export const useFamilyMembers = () => {
  const token = localStorage.getItem('token');
  return useQuery(GET_FAMILY_MEMBERS, {
    errorPolicy: 'all',
    skip: !token,
  });
}; 