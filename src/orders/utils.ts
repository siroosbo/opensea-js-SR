import { CROSS_CHAIN_SEAPORT_V1_5_ADDRESS } from "@opensea/seaport-js/lib/constants";
import { BigNumber } from "ethers";
import {
  OrderProtocol,
  OrdersQueryOptions,
  OrderSide,
  OrderV2,
  SerializedOrderV2,
  ProtocolData,
} from "./types";
import { Chain } from "../types";
import { accountFromJSON, assetBundleFromJSON } from "../utils";

const CHAIN_TO_NAME = {
  [Chain.Mainnet]: "ethereum",
  [Chain.Goerli]: "goerli",
};

export const DEFAULT_SEAPORT_CONTRACT_ADDRESS =
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS;

export const getOrdersAPIPath = (
  chain: Chain,
  protocol: OrderProtocol,
  side: OrderSide
) => {
  const chainName = CHAIN_TO_NAME[chain];
  const sidePath = side === "ask" ? "listings" : "offers";
  return `/v2/orders/${chainName}/${protocol}/${sidePath}`;
};

export const getCollectionPath = (slug: string) => {
  return `/api/v1/collection/${slug}`;
};

export const getBuildOfferPath = () => {
  return `/v2/offers/build`;
};

export const getPostCollectionOfferPath = () => {
  return `/v2/offers`;
};

export const getPostCollectionOfferPayload = (
  collectionSlug: string,
  protocol_data: ProtocolData
) => {
  return {
    criteria: {
      collection: { slug: collectionSlug },
    },
    protocol_data,
    protocol_address: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
  };
};

export const getBuildCollectionOfferPayload = (
  offererAddress: string,
  quantity: number,
  collectionSlug: string
) => {
  return {
    offerer: offererAddress,
    quantity,
    criteria: {
      collection: {
        slug: collectionSlug,
      },
    },
    protocol_address: DEFAULT_SEAPORT_CONTRACT_ADDRESS,
  };
};

export const getFulfillmentDataPath = (side: OrderSide) => {
  const sidePath = side === "ask" ? "listings" : "offers";
  return `/v2/${sidePath}/fulfillment_data`;
};

export const getFulfillListingPayload = (
  fulfillerAddress: string,
  order_hash: string,
  protocolAddress: string,
  chain: Chain
) => {
  const chainName = CHAIN_TO_NAME[chain];
  return {
    listing: {
      hash: order_hash,
      chain: chainName,
      protocol_address: protocolAddress,
    },
    fulfiller: {
      address: fulfillerAddress,
    },
  };
};

export const getFulfillOfferPayload = (
  fulfillerAddress: string,
  order_hash: string,
  protocolAddress: string,
  chain: Chain
) => {
  const chainName = CHAIN_TO_NAME[chain];
  return {
    offer: {
      hash: order_hash,
      chain: chainName,
      protocol_address: protocolAddress,
    },
    fulfiller: {
      address: fulfillerAddress,
    },
  };
};

type OrdersQueryPathOptions = "protocol" | "side";
export const serializeOrdersQueryOptions = (
  options: Omit<OrdersQueryOptions, OrdersQueryPathOptions>
) => {
  return {
    limit: options.limit,
    cursor: options.cursor,

    payment_token_address: options.paymentTokenAddress,
    maker: options.maker,
    taker: options.taker,
    owner: options.owner,
    bundled: options.bundled,
    include_bundled: options.includeBundled,
    listed_after: options.listedAfter,
    listed_before: options.listedBefore,
    token_ids: options.tokenIds ?? [options.tokenId],
    asset_contract_address: options.assetContractAddress,
    order_by: options.orderBy,
    order_direction: options.orderDirection,
    only_english: options.onlyEnglish,
  };
};

export const deserializeOrder = (order: SerializedOrderV2): OrderV2 => {
  return {
    createdDate: order.created_date,
    closingDate: order.closing_date,
    listingTime: order.listing_time,
    expirationTime: order.expiration_time,
    orderHash: order.order_hash,
    maker: accountFromJSON(order.maker),
    taker: order.taker ? accountFromJSON(order.taker) : null,
    protocolData: order.protocol_data,
    protocolAddress: order.protocol_address,
    currentPrice: BigNumber.from(order.current_price),
    makerFees: order.maker_fees.map(({ account, basis_points }) => ({
      account: accountFromJSON(account),
      basisPoints: basis_points,
    })),
    takerFees: order.taker_fees.map(({ account, basis_points }) => ({
      account: accountFromJSON(account),
      basisPoints: basis_points,
    })),
    side: order.side,
    orderType: order.order_type,
    cancelled: order.cancelled,
    finalized: order.finalized,
    markedInvalid: order.marked_invalid,
    clientSignature: order.client_signature,
    makerAssetBundle: assetBundleFromJSON(order.maker_asset_bundle),
    takerAssetBundle: assetBundleFromJSON(order.taker_asset_bundle),
  };
};
