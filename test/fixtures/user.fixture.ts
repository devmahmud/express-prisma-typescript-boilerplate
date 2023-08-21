import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import prisma from '@/client';
import { Prisma, Role } from '@prisma/client';

const password = 'password1';
const salt = bcrypt.genSaltSync(8);

export const userOne = {
  id: 1,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: Role.USER,
  isEmailVerified: false,
};

export const userTwo = {
  id: 2,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: Role.USER,
  isEmailVerified: false,
};

export const admin = {
  id: 3,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  password,
  role: Role.ADMIN,
  isEmailVerified: false,
};

export const insertUsers = async (users: Prisma.UserCreateManyInput[]) => {
  await prisma.user.createMany({
    data: users.map((user) => ({ ...user, password: bcrypt.hashSync(user.password, salt) })),
  });
};
