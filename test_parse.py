#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试解析第1签详情页
"""

import requests
from bs4 import BeautifulSoup
import re

# 获取第1签内容
url = 'https://www.k366.com/qian/lqlz_1.htm'
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get(url, headers=headers, timeout=30)

soup = BeautifulSoup(response.text, 'html.parser')

# 查找qianbox
qianbox = soup.find('div', class_='qianbox')
if qianbox:
    print("✓ 找到 qianbox")

    # 查找所有first容器
    first_divs = qianbox.find_all('div', class_='first')
    print(f"找到 {len(first_divs)} 个 first div")

    qian_data = {}

    for div in first_divs:
        label_div = div.find('div', class_='tab_tr_shi')
        content_div = div.find('div', class_='tab_contet_shi')

        if label_div and content_div:
            label = label_div.get_text().strip()
            content = content_div.get_text().strip()
            qian_data[label] = content
            print(f"\n--- {label} ---")
            print(content[:100])
else:
    print("✗ 未找到 qianbox")
