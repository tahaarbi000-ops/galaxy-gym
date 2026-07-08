export const stats = {
  totalMembers: 482,
  activeMembers: 401,
  totalTrainers: 14,
  monthlyRevenue: 38250,
  newThisMonth: 37,
  occupancyRate: 78,
};

export const revenueByMonth = [
  { month: 'Jan', revenue: 24500 },
  { month: 'Fév', revenue: 26800 },
  { month: 'Mar', revenue: 29100 },
  { month: 'Avr', revenue: 27650 },
  { month: 'Mai', revenue: 31200 },
  { month: 'Juin', revenue: 34800 },
  { month: 'Juil', revenue: 38250 },
];

export const membersByCategory = [
  { name: 'Musculation', value: 190 },
  { name: 'Box', value: 96 },
  { name: 'CrossFit', value: 74 },
  { name: 'Yoga', value: 58 },
  { name: 'Cardio', value: 64 },
];

export const members = [
  { id: 1, name: 'Youssef Trabelsi', email: 'youssef.t@mail.com', phone: '+216 22 145 987', category: 'Musculation', plan: 'Premium', status: 'Actif', joined: '2024-01-12' },
  { id: 2, name: 'Sarra Ben Ammar', email: 'sarra.ba@mail.com', phone: '+216 55 320 118', category: 'Box', plan: 'Standard', status: 'Actif', joined: '2024-02-03' },
  { id: 3, name: 'Karim Chaabane', email: 'karim.c@mail.com', phone: '+216 98 774 552', category: 'CrossFit', plan: 'VIP', status: 'Actif', joined: '2023-11-21' },
  { id: 4, name: 'Nour Jendoubi', email: 'nour.j@mail.com', phone: '+216 27 662 340', category: 'Yoga', plan: 'Standard', status: 'Inactif', joined: '2023-08-14' },
  { id: 5, name: 'Mehdi Sassi', email: 'mehdi.s@mail.com', phone: '+216 50 118 902', category: 'Musculation', plan: 'Premium', status: 'Actif', joined: '2024-03-29' },
  { id: 6, name: 'Ines Gharbi', email: 'ines.g@mail.com', phone: '+216 24 887 001', category: 'Cardio', plan: 'Standard', status: 'Actif', joined: '2024-04-18' },
  { id: 7, name: 'Anis Bouazizi', email: 'anis.b@mail.com', phone: '+216 29 553 617', category: 'Box', plan: 'VIP', status: 'Actif', joined: '2024-01-07' },
  { id: 8, name: 'Rania Haddad', email: 'rania.h@mail.com', phone: '+216 21 908 447', category: 'Musculation', plan: 'Premium', status: 'Suspendu', joined: '2023-06-02' },
];

export const trainers = [
  { id: 1, name: 'Coach Fares Baccar', specialty: 'Musculation', experience: '8 ans', members: 42, rating: 4.9, phone: '+216 26 114 887' },
  { id: 2, name: 'Coach Lina Meddeb', specialty: 'Box', experience: '6 ans', members: 31, rating: 4.8, phone: '+216 55 902 214' },
  { id: 3, name: 'Coach Bilel Ferjani', specialty: 'CrossFit', experience: '5 ans', members: 27, rating: 4.7, phone: '+216 98 220 561' },
  { id: 4, name: 'Coach Salma Kotti', specialty: 'Yoga', experience: '4 ans', members: 22, rating: 5.0, phone: '+216 22 774 903' },
  { id: 5, name: 'Coach Omar Zid', specialty: 'Cardio & HIIT', experience: '7 ans', members: 35, rating: 4.6, phone: '+216 27 441 083' },
  { id: 6, name: 'Coach Hana Rekik', specialty: 'Musculation', experience: '3 ans', members: 18, rating: 4.5, phone: '+216 24 663 720' },
];

export const secretaries = [
  { id: 1, name: 'Amira Ouertani', shift: 'Matin (08h-14h)', phone: '+216 20 118 445', email: 'amira.o@galaxygym.tn', status: 'Actif' },
  { id: 2, name: 'Walid Chtioui', shift: 'Après-midi (14h-20h)', phone: '+216 55 662 019', email: 'walid.c@galaxygym.tn', status: 'Actif' },
  { id: 3, name: 'Yosra Ben Romdhane', shift: 'Soir (17h-22h)', phone: '+216 29 887 332', email: 'yosra.b@galaxygym.tn', status: 'Congé' },
];

export const categories = [
  { id: 1, name: 'Musculation', members: 190, trainers: 3, price: 90, color: '#D4AF37', icon: 'FitnessCenter' },
  { id: 2, name: 'Box', members: 96, trainers: 2, price: 120, color: '#EF5A6F', icon: 'SportsMma' },
  { id: 3, name: 'CrossFit', members: 74, trainers: 1, price: 140, color: '#5AA9E6', icon: 'SportsGymnastics' },
  { id: 4, name: 'Yoga', members: 58, trainers: 1, price: 80, color: '#3ED598', icon: 'SelfImprovement' },
  { id: 5, name: 'Cardio & HIIT', members: 64, trainers: 1, price: 70, color: '#F5B85D', icon: 'DirectionsRun' },
  { id: 6, name: 'Natation', members: 40, trainers: 1, price: 100, color: '#8E7CC3', icon: 'Pool' },
];

export const subscriptions = [
  {
    id: 1,
    plan: 'Standard',
    price: 90,
    period: '/ mois',
    color: '#5AA9E6',
    features: ['Accès salle musculation', 'Casier inclus', '1 cours collectif / semaine', 'Suivi de base'],
  },
  {
    id: 2,
    plan: 'Premium',
    price: 150,
    period: '/ mois',
    color: '#D4AF37',
    highlight: true,
    features: ['Accès illimité toutes salles', 'Cours collectifs illimités', 'Coach dédié 2x / mois', 'Programme personnalisé', 'Accès sauna & spa'],
  },
  {
    id: 3,
    plan: 'VIP',
    price: 250,
    period: '/ mois',
    color: '#8E7CC3',
    features: ['Accès 24h/24', 'Coach personnel illimité', 'Suivi nutrition', 'Accès espace VIP lounge', 'Invités gratuits x2 / mois'],
  },
];

export const subscribers = [
  { id: 1, name: 'Youssef Trabelsi', plan: 'Premium', start: '2024-01-12', end: '2025-01-12', status: 'Actif' },
  { id: 2, name: 'Sarra Ben Ammar', plan: 'Standard', start: '2024-02-03', end: '2025-02-03', status: 'Actif' },
  { id: 3, name: 'Karim Chaabane', plan: 'VIP', start: '2023-11-21', end: '2024-11-21', status: 'Expire bientôt' },
  { id: 4, name: 'Nour Jendoubi', plan: 'Standard', start: '2023-08-14', end: '2024-08-14', status: 'Expiré' },
  { id: 5, name: 'Mehdi Sassi', plan: 'Premium', start: '2024-03-29', end: '2025-03-29', status: 'Actif' },
];
