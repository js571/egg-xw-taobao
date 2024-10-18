export type LinkInfoDto = {
  tk_biz_type: number;
  material_type: number;
  material_id?: string;
  tpwd_origin_url: string;
};
type LinkParseResult = {
  input_material_url: string,
  link_info_dto: {} | LinkInfoDto,
  msg?: string
  code?: number,
};

export type LinkParse = {
  data: {
    material_url_list: {
      material_url_list: LinkParseResult[]
    }
  }
};

export type ItemInfoDto = {
  cat_leaf_name: string,
  cat_name: string,
  free_shipment: boolean,
  hot_flag: string,
  input_num_iid: string,
  item_url: string,
  ju_online_end_time: string,
  ju_online_start_time: string,
  ju_pre_show_end_time: string,
  ju_pre_show_start_time: string,
  kuadian_promotion_info: string,
  material_lib_type: string,
  nick: string,
  num_iid: string,
  pict_url: string,
  presale_deposit: string,
  presale_end_time: number,
  presale_start_time: number,
  presale_tail_end_time: number,
  presale_tail_start_time: number,
  provcity: string,
  reserve_price: string,
  seller_id: number,
  small_images: { string: string[] },
  superior_brand: string,
  title: string,
  tmall_play_activity_end_time: number,
  tmall_play_activity_start_time: number,
  user_type: 1 | 2,
  zk_final_price: string
};


export type ItemInfoGet = {
  results: {
    n_tbk_item: ItemInfoDto[]
  },
  request_id: string
};

export type SearchItem = {
  item_basic_info: {
    annual_vol: string,
    brand_name: string,
    category_id: number,
    category_name: string,
    level_one_category_id: number,
    level_one_category_name: string,
    pict_url: string,
    provcity: string,
    real_post_fee: string,
    seller_id: number,
    shop_title: string,
    short_title: string,
    small_images: {
      string: string[] | null
    },
    sub_title: string,
    title: string,
    tk_total_sales: string,
    user_type: number,
    volume: number,
    white_image: string
  },
  item_id: string,
  presale_info: {
    presale_deposit: string
  },
  price_promotion_info: {
    final_promotion_path_list: {
      final_promotion_path_map_data: {
        promotion_desc: string,
        promotion_end_time: string,
        promotion_fee: string,
        promotion_id: string,
        promotion_start_time: string,
        promotion_title: string
      }[]
    },
    final_promotion_price: string,
    promotion_tag_list: {
      promotion_tag_map_data: {
        tag_name: string,
      }[]
    },
    reserve_price: string,
    zk_final_price: string
  },
  publish_info: {
    click_url: string,
    commission_type: string,
    coupon_share_url: string,
    daily_promotion_sales: number,
    income_info: {
      commission_amount: string,
      commission_rate: string
      subsidy_amount: string
      subsidy_rate: string
    },
    income_rate: string,
    two_hour_promotion_sales: number
  },
  scope_info: {
    superior_brand: number
  }
};

export type MaterialOptionalUpgrade = {
  result_list: {
    map_data: SearchItem[]
  }
};

export type OrderDto = {
  adzone_id: number;
  adzone_name: string;
  alimama_rate: string;
  alimama_share_fee: string;
  alimm_share_info_dto: {
    alimm_tech_service_fee: number;
    alimm_tech_service_pre_fee: number;
    alimm_tech_service_rate: number;
  };
  alipay_total_price: string;
  app_key: string;
  click_time: string;
  deposit_price: string;
  flow_source: string;
  income_rate: string;
  item_category_name: string;
  item_id: string;
  item_img: string;
  item_link: string;
  item_num: number;
  item_price: string;
  item_title: string;
  marketing_type: string;
  modified_time: string;
  order_type: string;
  pay_price: string;
  pub_id: number;
  pub_share_fee: string;
  pub_share_fee_for_commission: number;
  pub_share_fee_for_sdy: number;
  pub_share_pre_fee: string;
  pub_share_pre_fee_for_commission: number;
  pub_share_pre_fee_for_sdy: number;
  pub_share_rate: string;
  pub_share_rate_for_sdy: number;
  refund_tag: number;
  seller_nick: string;
  seller_shop_title: string;
  site_id: number;
  site_name: string;
  subsidy_fee: string;
  subsidy_rate: string;
  subsidy_type: string;
  tb_deposit_time: string;
  tb_paid_time: string;
  terminal_type: string;
  tk_create_time: string;
  tk_deposit_time: string;
  tk_earning_time: string;
  tk_order_role: number;
  tk_paid_time: string;
  tk_status: number;
  tk_total_rate: string;
  tk_total_rate_for_sdy: number;
  total_commission_fee: string;
  total_commission_rate: string;
  trade_id: string;
  trade_parent_id: string;
};

export type OrderGet = {
  data: {
    has_next: boolean,
    has_pre: boolean,
    page_no: number,
    page_size: number,
    position_index: string | null,
    results: {
      publisher_order_dto: OrderDto[]
    }
  }
};

// page_no = 1, page_size = 20, q, sort, hasCoupon, startPrice, endPrice, platformSelf, pid = 'mm_125432133_42406427_76768350122', relation_id = ''
export type SearchOption = {
  pageNo: number,
  pageSize: number,
  q: string,
  sort?: string | undefined,
  hasCoupon?: boolean | undefined,
  startPrice?: undefined | number,
  endPrice?: undefined | number,
  platformSelf?: boolean | undefined,
  pid: string,
  relation_id?: string,
  biz_scene_id?: number,
  needSuffix?: boolean,
};

export type ItemDto = {
  commission_rate: number;
  coupon_amount: number;
  coupon_end_time: null | string; // 假设 coupon_end_time 可能是字符串或 null
  coupon_id: null | string; // 假设 coupon_id 可能是字符串或 null
  coupon_info: string;
  coupon_remain_count: number;
  coupon_share_url: string;
  coupon_start_fee: number;
  coupon_total_count: number;
  item_description: string;
  item_id: string;
  item_url: string;
  nick: string;
  num_iid: string;
  pict_url: string;
  seller_id: number;
  shop_title: string;
  short_title: string;
  small_images: undefined | string[]; // 假设 small_images 可能是字符串数组或 undefined
  title: string;
  url: string;
  user_type: number;
  volume: number;
  white_image: string;
  zk_final_price: number;
};

export type searchCommonType = {
  commission_rate: number,
  coupon_amount: number,
  coupon_start_time: string | null,
  coupon_end_time: string | null,
  coupon_id: string | null,
  coupon_info: string,
  coupon_remain_count: number,
  coupon_share_url: string,
  coupon_start_fee: number,
  coupon_total_count: number,
  item_description: string,
  item_id: string,
  item_url: string,
  nick: string,
  num_iid: string,
  pict_url: string,
  seller_id: number,
  shop_title: string,
  short_title: string,
  small_images: { string: string[] | null},
  title: string,
  url: string,
  user_type: number,
  volume: number,
  white_image: string,
  zk_final_price: number,
};
