import { FriendList } from './friendlist';

export class User {
  // tslint:disable-next-line: variable-name
  _id: string;
  name: string;
  email: string;
  address: string;
  gender: string;
  password: string;
  info: string;
  imgUrl: string;
  freindRequists: [];
  freindList: FriendList[];
  online: boolean;
}
