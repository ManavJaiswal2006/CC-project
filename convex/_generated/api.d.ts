/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as distributor from "../distributor.js";
import type * as distributorApplications from "../distributorApplications.js";
import type * as order from "../order.js";
import type * as product from "../product.js";
import type * as promo from "../promo.js";
import type * as refund from "../refund.js";
import type * as review from "../review.js";
import type * as user from "../user.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  distributor: typeof distributor;
  distributorApplications: typeof distributorApplications;
  order: typeof order;
  product: typeof product;
  promo: typeof promo;
  refund: typeof refund;
  review: typeof review;
  user: typeof user;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
