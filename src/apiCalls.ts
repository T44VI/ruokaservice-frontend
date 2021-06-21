import {
  YearPrice,
  DateDay,
  Price,
  ApiResponse,
  AuthRole,
  AllUsers,
  User,
  IndUser,
  AllergyProfile,
  TMonth,
  Day,
  AllPayments
} from './types';
import { Dictionary } from 'lodash';

type RespPrice = {
  id: string;
  fod: 'lunch' | 'coffee' | 'dinner';
  start: string;
  end: string;
  normal: number;
  discount: number;
  young: number;
  child: number;
  special: boolean;
  time: string;
  name: string;
};

type WithUserId<T> = {
  userId: string;
  data: T;
};

const dateDayFromString = (s: string, defaultYear: number): DateDay => {
  const splitted = s.split('-');
  return {
    year: Number(splitted[0]) || defaultYear,
    month: Number(splitted[1]) ? Number(splitted[1]) - 1 : 0,
    day: Number(splitted[2]) || 1
  };
};

const handleErrors = (setAuth: (status: AuthRole) => void) => (
  res: Response
): Response => {
  if (!res.ok) {
    if (res.status === 401) {
      setAuth('unauthorized');
    }
    throw new Error('Unauthorized');
  }
  return res;
};

const stringFromDateDay = ({ year, month, day }: DateDay): string =>
  `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${
    day < 10 ? `0${day}` : day
  }`;

const headers = (password: string): Dictionary<string> => ({
  'Content-Type': 'application/json',
  Authorization: password
});
const endpoint: string = process.env.VUE_APP_ENDPOINT;

function withUserId<T>(data: T, userId: string): WithUserId<T> {
  return {
    userId,
    data
  };
}

const prices = {
  async getByYear(
    year: number,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<YearPrice> {
    const path = `${endpoint}/prices/getByYear/${year}`;
    const resp: ApiResponse<RespPrice[]> = await fetch(path, {
      method: 'GET',
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return {
      ts: resp.ts,
      year,
      prices: resp.data.map(price => ({
        ...price,
        start: dateDayFromString(price.start, year),
        end: dateDayFromString(price.end, year)
      }))
    };
  },
  async addNew(
    price: Price,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<YearPrice> {
    const path = `${endpoint}/prices/add`;
    const serverPrice: RespPrice = {
      ...price,
      start: stringFromDateDay(price.start),
      end: stringFromDateDay(price.end)
    };
    const resp: ApiResponse<RespPrice[]> = await fetch(path, {
      method: 'POST',
      headers: headers(password),
      body: JSON.stringify(serverPrice)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return {
      ts: resp.ts,
      year: price.start.year,
      prices: resp.data.map(p => ({
        ...p,
        start: dateDayFromString(p.start, price.start.year),
        end: dateDayFromString(p.end, price.start.year)
      }))
    };
  }
};

const users = {
  async getAllUsers(
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<AllUsers> {
    const path = `${endpoint}/user/getAll`;
    const resp: ApiResponse<User[]> = await fetch(path, {
      method: 'GET',
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return {
      ts: resp.ts,
      users: resp.data
    };
  },
  async addNewUser(
    name: string,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<AllUsers> {
    const path = `${endpoint}/user/add`;
    const resp: ApiResponse<User[]> = await fetch(path, {
      method: 'POST',
      headers: headers(password),
      body: name
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return {
      ts: resp.ts,
      users: resp.data
    };
  },
  async getUserById(
    id: string,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<IndUser> {
    const path = `${endpoint}/user/getById/${id}`;
    const resp: ApiResponse<IndUser> = await fetch(path, {
      method: 'GET',
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return resp.data;
  },
  async updateAllergyProfile(
    allergyProfile: AllergyProfile,
    id: string,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<IndUser> {
    const path = `${endpoint}/user/addAllergy`;
    const resp: ApiResponse<IndUser> = await fetch(path, {
      method: 'POST',
      body: JSON.stringify(withUserId(allergyProfile, id)),
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return resp.data;
  }
};

const regs = {
  async saveDay(
    day: Day,
    dateDay: DateDay,
    id: string,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<TMonth> {
    const path = `${endpoint}/regs/saveDay`;
    const resp: ApiResponse<TMonth> = await fetch(path, {
      method: 'POST',
      body: JSON.stringify({
        ...withUserId(day, id),
        year: dateDay.year,
        month: dateDay.month
      }),
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return resp.data;
  },
  async getMonthByUser(
    year: number,
    month: number,
    id: string,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<TMonth> {
    const path = `${endpoint}/regs/getMonthByUser`;
    const resp: ApiResponse<TMonth> = await fetch(path, {
      method: 'POST',
      body: JSON.stringify({
        ...withUserId({ year, month }, id)
      }),
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return resp.data;
  },
  async getKitchenDay(
    year: number,
    month: number,
    day: number,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<TMonth> {
    const path = `${endpoint}/regs/getKitchenDay`;
    const resp: ApiResponse<TMonth> = await fetch(path, {
      method: 'POST',
      body: JSON.stringify({
        year,
        month,
        day
      }),
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return resp.data;
  }
};

const payments = {
  async getPaymentsByYear(
    year: number,
    id: string,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<AllPayments> {
    const path = `${endpoint}/payments/getPaymentsByYear`;
    const resp: ApiResponse<AllPayments> = await fetch(path, {
      method: 'POST',
      body: JSON.stringify({
        ...withUserId(year, id)
      }),
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return resp.data;
  },
  async savePayment(
    payment: {
      dateDay: DateDay;
      amount: number;
      name: string;
      id?: string;
    },
    id: string,
    setAuth: (status: AuthRole) => void,
    password: string
  ): Promise<AllPayments> {
    const path = `${endpoint}/payments/save`;
    const resp: ApiResponse<AllPayments> = await fetch(path, {
      method: 'POST',
      body: JSON.stringify({
        ...withUserId(payment, id)
      }),
      headers: headers(password)
    })
      .then(handleErrors(setAuth))
      .then(res => {
        return res.json();
      });
    if (resp.role) {
      setAuth(resp.role);
    }
    return resp.data;
  }
};

export default { prices, users, regs, payments };
