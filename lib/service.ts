import { Api } from './constant';
import {
  LinkInfoDto,
  ItemInfoGet,
  LinkParse,
  MaterialOptionalUpgrade,
  OrderGet,
  SearchOption,
  CouponInfo,
  searchCommonType,
} from './type';
import TbkService from '@xw-tech/tbk-sdk';
import {
  mapNewSearchToOld,
  handlePwd,
  handlePage,
  parseTbResult,
  handleItemId,
} from './util';

declare module 'egg' {
  interface Application {
    tbk: {
      request: <T = any>(
        apiName: string,
        params: Record<string, any>
      ) => Promise<T>;
    };
    taobao: TaobaoService;
  }
}

class TaobaoService {
  private readonly tbkService: TbkService;
  constructor(
    appKey: string,
    secret: string,
    restUrl = 'https://gw.api.taobao.com/router/rest'
  ) {
    this.tbkService = new TbkService(appKey, secret, restUrl);
  }
  parsePid(pid: string) {
    const pidArr = pid.split('_');
    return {
      adzoneId: Number(pidArr[3]),
      siteId: Number(pidArr[2]),
    };
  }
  // 万能解析
  async linkParse(
    session: string,
    pwd: string,
    pid: string,
    relationId?: string
  ) {
    const { adzoneId } = this.parsePid(pid);
    const params: any = {
      adzone_id: adzoneId,
      material_dto: JSON.stringify([{ material_url: pwd }]),
      session,
    };
    if (relationId) {
      params.relation_id = relationId;
    }
    const err = {
      code: 15,
      msg: 'Remote service error',
      sub_code: 'isv.parse-result-invalid',
      sub_msg: '淘口令解析结果无效，当前淘口令无效',
    };
    const reg = /[\?&]id=([a-zA-Z0-9-]*)/;

    try {
      const response = await this.tbkService.request<LinkParse>(
        Api.万能解析,
        params
      );
      const dto = response?.data?.material_url_list?.material_url_list?.[0]
        .link_info_dto as LinkInfoDto;
      if (dto && dto.material_id) {
        const res: {
          biz_scene_id: number;
          url_type: number;
          origin_url?: string;
          num_iid?: string;
        } = {
          biz_scene_id: dto.tk_biz_type,
          url_type: dto.material_type,
        };
        if (dto.material_id) {
          res.num_iid = dto.material_id;
          res.origin_url =
            dto.tpwd_origin_url ||
            'https://uland.taobao.com/item/edetail?id=' + dto.material_id;
        } else {
          res.origin_url = dto.tpwd_origin_url;
          const itemId = dto.tpwd_origin_url.match(reg)?.[1];
          res.num_iid = itemId;
        }
        return res;
      }
      err.sub_msg = response.data.material_url_list.material_url_list[0]
        .msg as string;
      return Promise.reject(err);
    } catch (e) {
      console.log('错误', e);
      return Promise.reject(e);
    }
  }
  /**
   *
   * @param itemId 商品id
   * @param bizId 1-动态ID转链场景，2-消费者比价场景，3-商品库导购场景（不填默认为1）
   * @param promotionType   1-自购省，2-推广赚（代理模式专属ID，代理模式必填，非代理模式不用填写该字段）
   */
  async itemInfoGet(
    itemId: string,
    bizId: 1 | 2 | 3 = 1,
    promotionType: 1 | 2
  ) {
    const params: any = {
      num_iids: itemId + '',
      platform: 2,
    };
    if (bizId) {
      params.biz_scene_id = bizId;
    }
    if (promotionType) {
      params.promotion_type = promotionType;
    }
    try {
      const response = await this.tbkService.request<ItemInfoGet>(
        Api.商品详情获取,
        params
      );
      const res = response.results.n_tbk_item?.[0] || {};
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async pwdCreate(text: string, url: string) {
    const params = {
      text,
      url,
    };
    try {
      const res = await this.tbkService.request<{
        data: {
          model: string;
          password_simple: string;
        };
        request_id: string;
      }>(Api.淘口令创建, params);
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async spreadGet(url: string) {
    const json = [
      {
        url,
      },
    ];
    const urls = JSON.stringify(json);
    const data = {
      requests: urls,
    };
    const res = await this.tbkService.request(Api.长链转短链, data);
    return res;
  }
  async materialOptionalUpgrade(
    session: string,
    q: string,
    pid: string,
    relation_id = '',
    biz_scene_id = 1,
    promotion_type?: number
  ) {
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      q,
      adzone_id: adzoneId,
      site_id: siteId,
      session,
    };

    if (relation_id) {
      params.relation_id = relation_id;
    }
    if (biz_scene_id) {
      params.biz_scene_id = biz_scene_id;
    }
    if (promotion_type) {
      params.promotion_type = promotion_type;
    }
    try {
      const res = await this.tbkService.request<MaterialOptionalUpgrade>(
        Api.物料搜索,
        params
      );
      return res.result_list.map_data;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async materialOptionalYh(
    session: string,
    q: string,
    pid: string,
    relation_id = '',
    biz_scene_id = 1,
    promotion_type?: number
  ) {
    try {
      const res = await this.materialOptionalUpgrade(
        session,
        q,
        pid,
        relation_id,
        biz_scene_id,
        promotion_type
      );
      return res.map((item) => mapNewSearchToOld(item));
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async prodRecommend(
    session: string,
    pid: string,
    material_id: number,
    page_no = 1,
    page_size = 20
  ) {
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      page_size,
      page_no,
      adzone_id: adzoneId,
      site_id: siteId,
      material_id,
      session,
    };
    try {
      const res = await this.tbkService.request<MaterialOptionalUpgrade>(
        Api.物料精选,
        params
      );
      return res.result_list.map_data;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async orderGet(
    session: string,
    start_time: string,
    end_time: string,
    page_no = 1,
    query_type = 1,
    order_scene = 1,
    position_index = ''
  ) {
    const params: any = {
      query_type,
      page_no,
      start_time,
      end_time,
      session,
      page_size: 100,
      order_scene,
    };
    if (position_index) {
      params.position_index = position_index;
    }
    try {
      const res = await this.tbkService.request<OrderGet>(Api.订单获取, params);
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async punishOrderGet(params: Record<string, any>) {
    try {
      const res = await this.tbkService.request<any>(Api.处罚订单获取, params);
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async punishDgOrderGet(
    pageNo: number,
    pageSize: number,
    startTime: string,
    span: number,
    siteId: number
  ) {
    try {
      const params = {
        page_no: pageNo,
        start_time: startTime,
        span,
        page_size: pageSize,
        site_id: siteId,
      };
      const res = await this.tbkService.request<any>(Api.推广者处罚订单, {
        af_order_option: JSON.stringify(params),
      });
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async refundOrderGet(
    session: string,
    searchType: number,
    refundType: number,
    pageNo = 1,
    pageSize = 100,
    bizType = 1,
    startTime: string
  ) {
    try {
      const data = {
        search_type: searchType,
        refund_type: refundType,
        page_no: pageNo,
        start_time: startTime,
        page_size: pageSize,
        biz_type: bizType,
      };
      const params = { session, search_option: JSON.stringify(data) };
      const res = await this.tbkService.request<any>(Api.维权订单获取, params);
      return res;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async tbGoodsQuery(
    session: string,
    searchOption: SearchOption,
    suffix = false
  ): Promise<searchCommonType[]> {
    const {
      q,
      pid,
      pageNo,
      pageSize,
      startPrice,
      endPrice,
      platformSelf,
      sort,
      hasCoupon,
      relation_id,
      biz_scene_id,
      needSuffix,
    } = searchOption;
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      q,
      adzone_id: adzoneId,
      site_id: siteId,
      session,
      page_no: pageNo,
      page_size: pageSize,
    };
    if (startPrice || startPrice === 0) {
      params.start_price = startPrice;
    }
    if (endPrice || endPrice === 0) {
      params.end_price = endPrice;
    }
    if (platformSelf) {
      params.is_tmall = true;
    }
    if (sort) {
      params.sort = sort;
    }
    if (hasCoupon) {
      params.has_coupon = true;
    }

    if (relation_id) {
      params.relation_id = relation_id;
    }
    if (biz_scene_id) {
      params.biz_scene_id = biz_scene_id;
    }
    try {
      const res = await this.tbkService.request<MaterialOptionalUpgrade>(
        Api.物料搜索,
        params
      );
      const list = res.result_list.map_data;
      if (list.length === 1 && !list[0].item_id) {
        const newSearchOption: SearchOption = {
          ...searchOption,
          biz_scene_id: 2,
        };
        return this.tbGoodsQuery(session, newSearchOption, needSuffix);
      }
      const newList = list.map((item) => mapNewSearchToOld(item, suffix));
      return newList;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async pwdParse(
    session: string,
    pwd: string,
    pid: string,
    relationId: string
  ) {
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      adzone_id: adzoneId,
      site_id: siteId,
      session,
      material_list: pwd.replace(/,/g, '，'),
    };
    if (relationId) {
      params.relation_id = relationId;
    }
    try {
      const res = await this.tbkService.request<any>(Api.万能转链, params);
      const parsedRes = handlePwd(res);
      const { info } = parsedRes;
      const rParse = {
        biz_scene_id: info.tk_biz_type,
        click_url: info.click_url,
        model: info.model,
        num_iid: info.material_id,
        origin_url: info.originUrl,
        password: info.password,
        short_url: info.short_url,
        url_type: info.material_type,
      };
      return rParse;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async getActivity(
    session: string,
    pid: string,
    pageId: string,
    relationId: string
  ) {
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      adzone_id: adzoneId,
      site_id: siteId,
      session,
      page_id_list: pageId,
    };
    if (relationId) {
      params.relation_id = relationId;
    }
    try {
      const res = await this.tbkService.request<any>(Api.万能转链, params);
      const parsedRes = handlePage(res);
      const finalRes = {
        data: {
          click_url: parsedRes.info.cps_long_url,
          terminal_type: parsedRes.info.material_type,
        },
      };
      return finalRes;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async privilegeType3(
    session: string,
    pwd: string,
    pid: string,
    relationId = ''
  ) {
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      platform: 2,
      adzone_id: adzoneId,
      site_id: siteId,
      session,
      material_list: pwd.replace(/,/g, '，'),
    };
    if (relationId) {
      params.relation_id = relationId;
    }
    try {
      const response = await this.tbkService.request<any>(Api.万能转链, params);
      const isValidInfo =
        response.data.material_url_list &&
        response.data.material_url_list.material_url_list &&
        response.data.material_url_list.material_url_list.length &&
        Object.keys(
          response.data.material_url_list.material_url_list[0].link_info_dto
        ).length;
      if (isValidInfo) {
        const item: {
          cps_full_tpwd: string;
          cps_long_url: string;
          cps_short_tpwd: string;
          cps_short_url: string;
          material_type: number;
          tk_biz_type: number;
        } = response.data.material_url_list.material_url_list[0].link_info_dto;
        return item;
      }
      throw new Error(response.data.material_url_list.material_url_list[0].msg);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async privilegeNew(
    session: string,
    itemId: string,
    pid: string,
    relationId = '',
    bizId = 1,
    promotionType = 2
  ) {
    const _itemId = itemId + '';
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      platform: 2,
      adzone_id: adzoneId,
      site_id: siteId,
      session,
      biz_scene_id: bizId,
      item_id_list: _itemId,
    };
    if (relationId) {
      params.relation_id = relationId;
      params.promotion_type = promotionType;
    }
    try {
      const res = await this.tbkService.request<any>(Api.万能转链, params);
      const parseRes = await handleItemId(res);
      const finalRes = {
        coupon_end_time: parseRes.coupon && parseRes.coupon.coupon_end_time,
        coupon_info: parseRes.coupon && parseRes.coupon.coupon_desc,
        coupon_remain_count:
          parseRes.coupon && parseRes.coupon.coupon_remain_count,
        coupon_start_time: parseRes.coupon && parseRes.coupon.coupon_start_time,
        coupon_total_count:
          parseRes.coupon && parseRes.coupon.coupon_remain_count,
        ...parseRes.info,
      };
      return finalRes;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async getSimilar(
    session: string,
    pid: string,
    itemId: string,
    pageNo = 1,
    pageSize = 20,
    rate = 1
  ) {
    const { adzoneId, siteId } = this.parsePid(pid);
    const params = {
      session,
      adzone_id: adzoneId,
      page_no: pageNo,
      site_id: siteId,
      page_size: pageSize,
      material_id: 13256,
      item_id: itemId,
    };
    try {
      const res = await this.tbkService.request<MaterialOptionalUpgrade>(
        Api.猜你喜欢,
        params
      );
      const list = res.result_list.map_data.map((item) =>
        parseTbResult(item, rate)
      );
      return list;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async getLike(
    session: string,
    pageNo = 1,
    pageSize = 20,
    deviceType: string,
    deviceValue: string,
    pid: string,
    rate = 1
  ) {
    const { adzoneId, siteId } = this.parsePid(pid);
    const params: any = {
      session,
      adzone_id: adzoneId,
      page_no: pageNo,
      page_size: pageSize,
      site_id: siteId,
      material_id: 6708,
    };
    if (deviceValue) {
      params.device_type = deviceType;
      params.device_value = deviceValue;
      params.device_encrypt = 'MD5';
    }
    try {
      const res = await this.tbkService.request<MaterialOptionalUpgrade>(
        Api.猜你喜欢,
        params
      );
      const list = res.result_list.map_data.map((item) =>
        parseTbResult(item, rate)
      );
      return list;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async getCouponInfo(itemId: string, couponId: string) {
    const params = {
      item_id: itemId,
      activity_id: couponId,
    };
    try {
      const res = await this.tbkService.request<{
        data: CouponInfo;
      }>(Api.优惠券信息, params);
      return res.data;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }
  async getTljReport(rightsId: string, pid: string) {
    const { adzoneId } = this.parsePid(pid);
    const params = {
      rights_id: rightsId,
      adzone_id: adzoneId,
    };
    try {
      const res = await this.tbkService.request<{
        model: {
          extra: {
            alipay_amt: string;
            alipay_num: number;
            cm_settle_amt: string;
            get_rate: string;
            pre_pub_share_fee_for_disp: string;
            refund_num: number;
            refund_sum_amt: string;
            remaining_amt: string;
            remaining_num: number;
            use_num: number;
            use_rate: string;
            use_sum_amt: string;
            win_pv: number;
            win_sum_amt: string;
          };
        };
      }>(Api.淘礼金使用信息, params);
      return res.model;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }
  async createTlj(
    pid: string,
    item_id: string,
    per_face: string,
    send_start_time: string,
    send_end_time: string,
    use_end_time: string,
    total_num = 1,
    name = '专享淘礼金福利',
    user_total_win_num_limit = 1,
    use_start_time: string,
    use_end_time_mode = 1,
    security_switch = true,
    campaign_type = '',
    use_threshold = 0
  ) {
    const { adzoneId } = this.parsePid(pid);
    const params: any = {
      adzone_id: adzoneId,
      item_id,
      per_face,
      send_start_time,
      send_end_time,
      use_end_time,
      total_num,
      name,
      user_total_win_num_limit,
      use_start_time,
      use_end_time_mode,
      security_switch,
    };
    if (use_end_time_mode === 1) {
      delete params.use_start_time;
    }
    if (campaign_type) {
      params.campaign_type = campaign_type;
    }
    if (use_threshold) {
      params.use_threshold = use_threshold;
    }
    try {
      const res = await this.tbkService.request<any>(Api.淘礼金生成, params);
      if (!res.result.success) {
        return Promise.reject(res.result.msg_info);
      }
      return res.result.model;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }
  async stopTlj(rightsId: string, pid: string) {
    const { adzoneId } = this.parsePid(pid);
    const params = {
      rights_id: rightsId,
      adzone_id: adzoneId,
    };
    try {
      const res = await this.tbkService.request<any>(Api.淘礼金停止, params);
      if (!res.result_success) {
        return Promise.reject(res.result_success);
      }
      return res.model;
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }
  async auth(code: string) {
    const params = {
      code,
    };
    try {
      const res = await this.tbkService.request<any>(Api.授权, params);
      return JSON.parse(res.token_result);
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }
}
export default TaobaoService;
