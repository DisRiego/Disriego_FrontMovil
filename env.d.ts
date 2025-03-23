declare module "@env" {
  export const API_URL: string;
  export const API_FRONT: string;

  // Auth
  export const ROUTE_BACKEND_LOGIN: string;
  export const ROUTE_BACKEND_LOGOUT: string;
  export const ROUTE_BACKEND_REQUEST_RESET_PASSWORD: string;

  // Users
  export const ROUTE_BACKEND_FIRST_LOGIN_REGISTER: string;
  export const ROUTE_BACKEND_PRE_REGISTER_COMPLETE: string;
  export const ROUTE_BACKEND_PRE_REGISTER_VALIDATE: string;
  export const ROUTE_BACKEND_USER_CHANGE_PASSWORD: string;
  export const ROUTE_BACKEND_USER_EDIT_PROFILE: string;
  export const ROUTE_BACKEND_USER_UPDATE_PHOTO: string;
  export const ROUTE_BACKEND_USER_GET_BY_ID: string;

  // Company
  export const ROUTE_BACKEND_COMPANY_TYPE_CROPS: string;
  export const ROUTE_BACKEND_COMPANY_PAYMENT_INTERVALS: string;

  // Properties
  export const ROUTE_BACKEND_PROPERTY_LOTS: string;
  export const ROUTE_BACKEND_PROPERTY_BY_USER: string;
}
