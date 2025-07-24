import { gql } from '@apollo/client';

// User fragments
export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    role
    photo
    waiverSigned
    joinedDate
    active
  }
`;

export const USER_BASIC_FIELDS = gql`
  fragment UserBasicFields on User {
    id
    name
    role
    photo
  }
`;

// Session fragments
export const SESSION_FIELDS = gql`
  fragment SessionFields on Session {
    id
    name
    sport
    demo
    description
    birthYear
    ageRange {
      minAge
      maxAge
    }
    price
    priceDiscount
    startDates
    endDate
    timeStart
    timeEnd
    trainer
    trainers {
      id
      name
    }
    staffOnly
    isActive
    isPubliclyVisible
    slug
    coverImage
    images
    availableSpots
    rosterLimit
    field {
      fieldNumb
      location
    }
    createdAt
    updatedAt
  }
`;

export const SESSION_BASIC_FIELDS = gql`
  fragment SessionBasicFields on Session {
    id
    name
    sport
    price
    trainer
    isActive
    slug
    rosterLimit
    availableSpots
  }
`;

export const SESSION_ADMIN_FIELDS = gql`
  fragment SessionAdminFields on Session {
    id
    name
    sport
    demo
    description
    birthYear
    ageRange {
      minAge
      maxAge
    }
    price
    priceDiscount
    startDates
    endDate
    timeStart
    timeEnd
    trainer
    trainers {
      id
      name
      role
    }
    staffOnly
    isActive
    isPubliclyVisible
    slug
    coverImage
    images
    availableSpots
    rosterLimit
    field {
      fieldNumb
      location
    }
    createdAt
    updatedAt
  }
`;

// Template fragments
export const TEMPLATE_FIELDS = gql`
  fragment TemplateFields on SessionTemplate {
    id
    name
    sport
    description
    birthYear
    ageRange {
      minAge
      maxAge
    }
    price
    priceDiscount
    defaultDuration
    trainers {
      id
      name
    }
    isActive
    coverImage
    images
    rosterLimit
    createdAt
    updatedAt
  }
`;

// Period fragments
export const PERIOD_FIELDS = gql`
  fragment PeriodFields on SchedulePeriod {
    id
    name
    startDate
    endDate
    template {
      id
      name
      sport
      price
    }
    daysOfWeek
    timeStart
    timeEnd
    isActive
    createdAt
    updatedAt
  }
`;

// Instance fragments
export const INSTANCE_FIELDS = gql`
  fragment InstanceFields on SessionInstance {
    id
    date
    startTime
    endTime
    isActive
    template {
      id
      name
      sport
      price
      rosterLimit
    }
    period {
      id
      name
    }
    trainers {
      id
      name
    }
    availableSpots
    createdAt
    updatedAt
  }
`;

// Player fragments
export const PLAYER_FIELDS = gql`
  fragment PlayerFields on Player {
    id
    name
    birthDate
    sex
    waiverSigned
    isMinor
    profImg
  }
`;

// Booking fragments
export const BOOKING_FIELDS = gql`
  fragment BookingFields on Booking {
    id
    session {
      ...SessionBasicFields
    }
    player {
      ...PlayerFields
    }
    price
    paid
    createdAt
  }
  ${SESSION_BASIC_FIELDS}
  ${PLAYER_FIELDS}
`;