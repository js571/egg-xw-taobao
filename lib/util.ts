import dayjs from 'dayjs';
import { SearchItem, searchCommonType } from './type';
const findStartFee = (str: string) => {
  const startFee = str.match(/满(\d+\.?\d*)减/);
  if (startFee) {
    return parseFloat(startFee[1]);
  }
  return 0;
};
export const mapNewSearchToOld = (res: SearchItem, suffix = false) => {
  let couponAmount: string | number = 0;
  let coupon_start_time: string | null = null;
  let coupon_end_time: string | null = null;
  let coupon_id: string | null = null;
  let coupon_start_fee = 0;
  let promotion_desc = '';
  let coupon_remain_count = 0;
  let coupon_total_count = 0;
  if (
    res &&
    res.price_promotion_info.final_promotion_path_list &&
    res.price_promotion_info.final_promotion_path_list.final_promotion_path_map_data.find(item => item.promotion_title === '商品券' || item.promotion_title === '店铺券')
  ) {
    const coupon = res.price_promotion_info.final_promotion_path_list.final_promotion_path_map_data[0];
    couponAmount = coupon.promotion_fee;
    coupon_start_time = dayjs(Number(coupon.promotion_start_time)).format('YYYY-MM-DD HH:mm:ss');
    coupon_end_time = dayjs(Number(coupon.promotion_end_time)).format('YYYY-MM-DD HH:mm:ss');
    coupon_id = coupon.promotion_id;
    promotion_desc = coupon.promotion_desc;
    coupon_start_fee = findStartFee(coupon.promotion_desc);
    coupon_remain_count = 1000;
    coupon_total_count = 1000;
  }
  const itemInfo = res.item_basic_info;
  const item: searchCommonType = {
    commission_rate: Number(res.publish_info.income_info.commission_rate),
    coupon_amount: Number(couponAmount),
    coupon_end_time,
    coupon_start_time,
    coupon_id,
    coupon_info: promotion_desc,
    coupon_remain_count,
    coupon_share_url: '',
    coupon_start_fee,
    coupon_total_count,
    item_description: itemInfo.sub_title,
    item_id: res.item_id,
    item_url: `https://uland.taobao.com/item/edetail?id=${res.item_id}`,
    nick: itemInfo.shop_title,
    num_iid: res.item_id,
    pict_url: itemInfo.pict_url,
    seller_id: itemInfo.seller_id,
    shop_title: itemInfo.shop_title,
    short_title: itemInfo.short_title,
    small_images: itemInfo.small_images,
    title: itemInfo.title,
    url: res.publish_info.coupon_share_url || res.publish_info.click_url,
    user_type: itemInfo.user_type,
    volume: itemInfo.volume,
    white_image: itemInfo.white_image,
    zk_final_price: Number(res.price_promotion_info.zk_final_price),
  };
  if (suffix) {
    item.item_id = `${item.item_id}_2`;
    item.num_iid = `${item.num_iid}_2`;
  }
  return item;
};

export const parseTbResult = (item: any, rate = 1) => {
  const _item = mapNewSearchToOld(item);
  const isMj = _item.coupon_start_fee * 1 > _item.zk_final_price * 1;
  const coupon = isMj ? 0 : _item.coupon_amount || 0;
  const promotionPrice = Number((Number(_item.zk_final_price - coupon).toFixed(2))) * 1;
  const commissionRate = Number(_item.commission_rate);
  const couponList: any[] = [];
  if (_item.coupon_amount) {
    couponList.push({
      couponUrl: _item.coupon_share_url,
      amount: Number(_item.coupon_amount),
      quota: Number(_item.coupon_start_fee),
      start: _item.coupon_start_time,
      end: _item.coupon_end_time,
      couponType: 'PROD',
    });
  }
  const res = {
    platform: 'TB',
    link: _item.item_url,
    itemId: _item.item_id,
    title: _item.title,
    price: Number(_item.zk_final_price),
    promotionPrice,
    img: 'https:' + _item.pict_url,
    shopName: _item.shop_title,
    coupon: couponList,
    commissionRate,
    user_type: _item.user_type,
    commission: Number((((promotionPrice * commissionRate) / 100 / 100) * rate).toFixed(2)),
    sales: _item.volume,
  };
  return res;
};

export const wrapIosPwd = (pwd: string, suffix = 'AC01') => {
  const pwdNew = pwd.replace(/￥/, '').replace('￥', '');
  return `1 (${pwdNew} ${suffix})/`;
};

export const handlePwd = (response: any) => {
  const isValidInfo = response.data.material_url_list && response.data.material_url_list.material_url_list && response.data.material_url_list.material_url_list.length && Object.keys(response.data.material_url_list.material_url_list[0].link_info_dto).length;
  if (isValidInfo) {
    const parseInfo = response.data.material_url_list.material_url_list[0];
    const bestPwd = parseInfo.coupon_info_dto && Object.keys(parseInfo.coupon_info_dto).length ? parseInfo.link_info_dto.coupon_short_tpwd : parseInfo.link_info_dto.cps_short_tpwd;
    const bestUrl = parseInfo.coupon_info_dto && Object.keys(parseInfo.coupon_info_dto).length ? parseInfo.link_info_dto.coupon_long_url : parseInfo.link_info_dto.cps_long_url;
    const res: any = {
      coupon: parseInfo.coupon_info_dto,
      commission: parseInfo.promotion_info_dto,
      info: {
        pwd: wrapIosPwd(bestPwd),
        url: bestUrl,
        tk_biz_type: parseInfo.link_info_dto.tk_biz_type,
        material_id: parseInfo.link_info_dto.material_id,
        material_type: parseInfo.link_info_dto.material_type,
        originUrl: parseInfo.link_info_dto.tpwd_origin_url,
        model: parseInfo.link_info_dto.coupon_short_tpwd || parseInfo.link_info_dto.cps_short_tpwd,
        password: parseInfo.link_info_dto.coupon_full_tpwd || parseInfo.link_info_dto.cps_full_tpwd,
        short_url: parseInfo.link_info_dto.coupon_short_url || parseInfo.link_info_dto.cps_short_url,
        click_url: parseInfo.link_info_dto.cps_long_url,
      },
    };
    if (parseInfo.link_info_dto.material_type === 1 && res.info.originUrl) {
      const match = res.info.originUrl.match(/activityId=([\w\d]+?)(?:$|\b|\s|&)/);
      if (match) {
        res.info.activity_id = match[1];
      }
    }
    return res;
  }
  throw new Error(response.data.material_url_list.material_url_list[0].msg);
};

export const handlePage = (response: any) => {
  const isValidInfo = response.data.event_url_list && response.data.event_url_list.event_url_list && response.data.event_url_list.event_url_list.length && Object.keys(response.data.event_url_list.event_url_list[0].link_info_dto).length;
  if (isValidInfo) {
    const parseInfo = response.data.event_url_list.event_url_list[0];
    const res = {
      info: {
        pwd: wrapIosPwd(parseInfo.link_info_dto.cps_short_tpwd),
        url: parseInfo.link_info_dto.cps_short_url,
        cps_long_url: parseInfo.link_info_dto.cps_long_url,
        material_type: parseInfo.link_info_dto.material_type,
      },
    };
    return res;
  }
  throw new Error(response.data.event_url_list.event_url_list[0].msg);
};

export const handleItemId = (response: any) => {
  const isValidInfo =
    response.data.item_url_list &&
    response.data.item_url_list.item_url_list &&
    response.data.item_url_list.item_url_list.length &&
    Object.keys(response.data.item_url_list.item_url_list[0].link_info_dto).length;
  if (isValidInfo) {
    const parseInfo = response.data.item_url_list.item_url_list[0];
    const link_info_dto = parseInfo.link_info_dto;
    const rate = parseInfo.promotion_info_dto ? parseInfo.promotion_info_dto.commission_rate : '0';
    const res = {
      coupon: parseInfo.coupon_info_dto,
      commission: parseInfo.promotion_info_dto,
      info: {
        coupon_click_url: link_info_dto.coupon_long_url,
        item_id: link_info_dto.item_id,
        item_url: link_info_dto.cps_long_url,
        max_commission_rate: rate,
        min_commission_rate: rate,
        coupon_short_tpwd: wrapIosPwd(link_info_dto.coupon_short_tpwd),
        cps_short_tpwd: wrapIosPwd(link_info_dto.cps_short_tpwd),
        material_type: link_info_dto.material_type,
      },
    };
    return res;
  }
  throw new Error(response.data.item_url_list.item_url_list[0].msg);
};
