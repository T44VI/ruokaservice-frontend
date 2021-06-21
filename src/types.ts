import _, { Dictionary } from 'lodash';

export interface Config {
  defaultUser?: string;
}

export interface State {
  apiCall: ApiCallStatus;
  choosedMonth: DMonth;
  user: UserData;
  allUsers: AllUsers;
  months: Dictionary<TMonth>;
  prices: Dictionary<YearPrice>;
  allergies: AllergiesTs;
  admin?: AdminData;
  kitchenDay?: KitchenDay;
  payments: AllPayments;
}

export interface Payment {
  id: string;
  amount: number;
  name: string;
  type: 'ind' | 'month' | 'year';
  date: DateDay;
}

export interface AllPayments {
  ts: number;
  payments: Payment[];
}

export interface ApiResponse<T> {
  ts: number;
  role?: 'user' | 'admin';
  data: T;
}

export interface AllUsers {
  ts: number;
  users: User[];
}

export interface User {
  id: string;
  name: string;
  archievedBalance: number;
}

export type IndUser = User & {
  allergyProfiles: AllergyProfile[];
};

export type AuthRole = 'user' | 'admin' | 'unauthorized';

export interface AdminData {
  year: number;
}

export interface DateDayBlock {
  start: DateDay;
  end: DateDay;
  fod: 'lunch' | 'coffee' | 'dinner';
}

export interface AllergiesTs {
  ts: number;
  allergies: string[];
}

export interface UserData {
  id?: string;
  user?: string;
  profiles?: AllergyProfile[];
  role: AuthRole;
  password: string;
}

export interface AllergyProfile {
  id: string;
  name: string;
  base: 'normal' | 'discount' | 'young' | 'child';
  allergies: string[];
}

export interface PriceEditorBase {
  price?: Price;
}

export interface AllergyEditorProfile {
  base: 'normal' | 'discount' | 'young' | 'child';
  allergies: string[];
}

export interface DMonth {
  year: number;
  month: number;
}

export interface ApiCallStatus {
  month: number;
  price: number;
  user: number;
  kitchen: number;
  payments: number;
}

export type apiCallOption = 'month' | 'price' | 'user' | 'kitchen' | 'payments';

export interface KitchenDay {
  month: number;
  year: number;
  day: number;
  ts: number;
  lunch: UserFood[];
  coffee: UserFood[];
  dinner: UserFood[];
}

export type UserFood = Food & {
  userId: string;
};

export interface TMonth {
  year: number;
  month: number;
  ts: number;
  days: Day[];
  allDays: { num: number; count: number }[];
}

export interface Day {
  num: number;
  lunch?: Food;
  coffee?: Food;
  dinner?: Food;
}

export interface Food {
  normal?: number;
  discount?: number;
  young?: number;
  child?: number;
  specialIds?: SpecialFoodWithId[];
  special?: SpecialFood[];
}

export interface SpecialFoodWithId {
  specialId: string;
  base: 'normal' | 'discount' | 'young' | 'child';
  count: number;
  allergies: string[];
  name: string;
}

export interface SpecialFood {
  base: 'normal' | 'discount' | 'young' | 'child';
  count: number;
  allergies: string[];
}

export interface Price {
  id: string;
  fod: 'lunch' | 'coffee' | 'dinner';
  special: boolean;
  name: string;
  time: string;
  normal: number;
  discount: number;
  young: number;
  child: number;
  start: DateDay;
  end: DateDay;
}

export interface YearPrice {
  ts: number;
  year: number;
  prices: Price[];
}

export interface DateDay {
  year: number;
  month: number;
  day: number;
}
