-- Seed 5 suppliers (3 lens labs + 2 frame factories).
-- Contact info is fabricated placeholder — phones intentionally end in
-- 0000/1234/5678 to make obvious they're not real. Replace with actual
-- vendor contacts before going to production.

INSERT INTO suppliers (
  id, name_zh, name_en, kind,
  contact_person, contact_email, contact_phone, shipping_address,
  payment_terms, lead_time_days, notes,
  active, sort_order
) VALUES
  (
    'mingyue',
    '明月光学',
    'Mingyue Optical',
    'lens',
    '李销售经理',
    'sales@mingyue-optical.com.cn',
    '+86 511 8612 0000',
    '江苏省丹阳市丹北镇眼镜城路 88 号',
    'NET30',
    7,
    '主力镜片供应商，明月 1.56/1.60/1.67/1.74 全系列覆盖；批价表已 import 到 lens_skus.cost_cny_cents。',
    1, 10
  ),
  (
    'zeiss-china',
    '蔡司光学（中国）有限公司',
    'ZEISS Optical China',
    'lens',
    '王客户经理',
    'china-orders@zeiss.com',
    '+86 21 5208 1000',
    '上海市浦东新区张江高科技园区蔡司大厦 F18',
    'prepaid',
    14,
    '蔡司中国总代，订单需预付；交期较长但品质稳定。处方片走 Zeiss Vision Lab 上海 cutting。',
    1, 20
  ),
  (
    'essilor-china',
    '依视路（中国）光学有限公司',
    'Essilor China',
    'lens',
    '陈采购对接人',
    'cn-b2b@essilor.com',
    '+86 21 6088 6000',
    '上海市虹桥商务区申长路 1099 号',
    'NET30',
    10,
    '依视路 + 旗下 Transitions 变色片。NET30 账期；Crizal 镀膜默认含。',
    1, 30
  ),
  (
    'wenzhou-acetate',
    '温州鸿利板材镜架厂',
    'Wenzhou Hongli Acetate Frames',
    'frame',
    '黄厂长',
    'hongli-frames@126.com',
    '+86 577 8800 1234',
    '浙江省温州市瓯海区眼镜工业园 A 区 12 号',
    'NET30',
    5,
    '板材（acetate）镜架主力代工，可贴 OEM logo；最小起订量 50 副 / 款。',
    1, 40
  ),
  (
    'shenzhen-titanium',
    '深圳精钛光学制品有限公司',
    'Shenzhen JingTi Optical',
    'frame',
    '刘业务',
    'jingti-titanium@163.com',
    '+86 755 2832 5678',
    '广东省深圳市龙岗区横岗街道横岗大道 666 号',
    'NET30',
    7,
    '钛/β 钛金属镜架代工，IP 电镀；高端线主供。',
    1, 50
  );

-- Backfill lens_skus.supplier_id by brand mapping
UPDATE lens_skus SET supplier_id = 'mingyue'       WHERE brand_id IN ('inhouse', 'mingyue');
UPDATE lens_skus SET supplier_id = 'zeiss-china'   WHERE brand_id = 'zeiss';
UPDATE lens_skus SET supplier_id = 'essilor-china' WHERE brand_id IN ('essilor', 'transitions');
