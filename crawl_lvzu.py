#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
吕祖灵签爬虫脚本 - 从详情页获取完整信息
爬取完整的100签内容并保存为Markdown文档
"""

import requests
from bs4 import BeautifulSoup
import re
import os
import time
from pathlib import Path

def fetch_qian_detail(qian_number):
    """获取单个签的详情页内容"""
    base_url = f"https://www.k366.com/qian/lqlz_{qian_number}.htm"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    try:
        print(f"  正在获取第 {qian_number} 签...")
        response = requests.get(base_url, headers=headers, timeout=30)
        response.raise_for_status()
        response.encoding = 'utf-8'
        return response.text
    except Exception as e:
        print(f"  获取第 {qian_number} 签失败: {e}")
        return None

def parse_qian_detail(html_content, qian_number):
    """解析单个签的详情页内容"""
    if not html_content:
        return None

    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        qian_info = {'number': qian_number}

        # 提取标题
        title_tag = soup.find('title')
        if title_tag:
            title_text = title_tag.get_text()
            # 从标题中提取签的描述
            match = re.search(r'古人[^、]+', title_text)
            if match:
                qian_info['title'] = f"第{qian_number}签：{match.group(0)}"
            else:
                qian_info['title'] = f"第{qian_number}签"
        else:
            qian_info['title'] = f"第{qian_number}签"

        # 提取签文、解曰、详解等内容
        qian_data = {}

        # 查找qianbox容器
        qianbox = soup.find('div', class_='qianbox')
        if qianbox:
            # 查找所有first容器
            first_divs = qianbox.find_all('div', class_='first')

            for div in first_divs:
                # 查找标签（如【签诗】、【解曰】）
                label_div = div.find('div', class_='tab_tr_shi')
                content_div = div.find('div', class_='tab_contet_shi')

                if label_div and content_div:
                    label = label_div.get_text().strip()
                    content = content_div.get_text().strip()

                    if label and content:
                        qian_data[label] = content

        # 构建完整内容
        content_parts = []

        if '【签诗】' in qian_data:
            qian_info['qianwen'] = qian_data['【签诗】']
            content_parts.append(f"**签文**：\n{qian_data['【签诗】']}")

        if '【解曰】' in qian_data:
            content_parts.append(f"**解曰**：\n{qian_data['【解曰】']}")

        if '【详解】' in qian_data:
            content_parts.append(f"**详解**：\n{qian_data['【详解】']}")

        # 如果有其他备注信息
        other_keys = [key for key in qian_data.keys() if key not in ['【签诗】', '【解曰】', '【详解】']]
        for key in other_keys:
            content_parts.append(f"**{key.replace('【', '').replace('】', '')}**：\n{qian_data[key]}")

        qian_info['content'] = '\n\n'.join(content_parts)

        return qian_info

    except Exception as e:
        print(f"  解析第 {qian_number} 签时出错: {e}")
        return None

def crawl_all_qian():
    """爬取所有100签的内容"""
    print("=" * 60)
    print("吕祖灵签爬虫程序")
    print("=" * 60)
    print("正在从详情页获取100签内容...\n")

    lingqian_list = []

    for i in range(1, 101):
        html_content = fetch_qian_detail(i)
        if html_content:
            qian_info = parse_qian_detail(html_content, i)
            if qian_info:
                lingqian_list.append(qian_info)
                print(f"✓ 第 {i:3d} 签: {qian_info['title']}")
            else:
                print(f"✗ 第 {i:3d} 签: 解析失败")
        else:
            print(f"✗ 第 {i:3d} 签: 获取失败")

        # 添加延迟，避免请求过快
        time.sleep(0.5)

    print(f"\n总共成功提取 {len(lingqian_list)} 签")
    return lingqian_list

def save_to_markdown(lingqian_list, output_dir):
    """将签文保存为Markdown文档"""
    if not lingqian_list:
        print("没有签文数据可保存")
        return

    # 创建输出目录
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # 创建主文档
    main_file = output_path / "吕祖灵签完整版.md"

    with open(main_file, 'w', encoding='utf-8') as f:
        # 写入标题
        f.write("# 吕祖灵签完整版（100签）\n\n")
        f.write("> 吕祖灵签是道教八仙之一吕洞宾所赐，共100签，涵盖人生各个方面。\n\n")
        f.write("## 目录\n\n")

        # 写入目录
        for qian in lingqian_list:
            title = qian.get('title', f"第{qian['number']}签")
            f.write(f"- [{title}](#第{qian['number']}签)\n")

        f.write("\n---\n\n")

        # 写入每个签的详细内容
        for qian in lingqian_list:
            f.write(f"## 第{qian['number']}签\n\n")
            title = qian.get('title', f"第{qian['number']}签")
            f.write(f"**{title}**\n\n")

            # 写入签文（如果有）
            if 'qianwen' in qian and qian['qianwen']:
                f.write(f"**签文**：\n```\n{qian['qianwen']}\n```\n\n")

            # 写入完整内容
            f.write(f"**详解**：\n\n{qian['content']}\n\n")
            f.write("---\n\n")

    print(f"主文档已保存: {main_file}")

    # 创建单独的每个签的文档
    individual_dir = output_path / "各签详解"
    individual_dir.mkdir(exist_ok=True)

    for qian in lingqian_list:
        qian_file = individual_dir / f"第{qian['number']}签.md"
        with open(qian_file, 'w', encoding='utf-8') as f:
            f.write(f"# 第{qian['number']}签\n\n")
            title = qian.get('title', f"第{qian['number']}签")
            f.write(f"**{title}**\n\n")

            if 'qianwen' in qian and qian['qianwen']:
                f.write(f"**签文**：\n```\n{qian['qianwen']}\n```\n\n")

            f.write(f"**详解**：\n\n{qian['content']}\n\n")

    print(f"各签详解文档已保存到: {individual_dir}")

def main():
    """主函数"""
    # 爬取所有签文
    lingqian_list = crawl_all_qian()

    if lingqian_list:
        # 保存到文件
        output_dir = "吕祖灵签文档详情版"
        save_to_markdown(lingqian_list, output_dir)

        print("\n" + "=" * 60)
        print(f"所有签文已成功保存到: {output_dir}")
        print("=" * 60)
    else:
        print("未能提取到签文内容")

if __name__ == "__main__":
    main()