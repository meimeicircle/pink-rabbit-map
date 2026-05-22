
import React, { useState } from 'react';

// 使用 GitHub 上開源的 Fluent Emoji 平面化鏡像 (Hex Codepoint based) 作為備用
const FLUENT_EMOJI_BASE_URL = 'https://raw.githubusercontent.com/bchiang7/fluent-emojis/main/dist/3d/';

// 強制鎖定特定 Emoji 的官方 3D CDN 網址，確保絕對能載入
const EMOJI_DIRECT_LINKS: Record<string, string> = {
  '🐰': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rabbit%20face/3D/rabbit_face_3d.png',
  '📝': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Memo/3D/memo_3d.png',
  '📜': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Scroll/3D/scroll_3d.png',
  '🐻': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Bear%20face/3D/bear_face_3d.png',
  '🐱': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Cat%20face/3D/cat_face_3d.png',
  '🐶': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Dog%20face/3D/dog_face_3d.png',
  '🦊': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Fox/3D/fox_3d.png',
  '🦁': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Lion/3D/lion_3d.png',
  '🐯': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Tiger%20face/3D/tiger_face_3d.png',
  '🐨': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Koala/3D/koala_3d.png',
  '🐼': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Panda/3D/panda_3d.png',
  '🐷': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Pig%20face/3D/pig_face_3d.png',
  '🦄': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Unicorn/3D/unicorn_3d.png',
  '🐔': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Chicken/3D/chicken_3d.png',
  '🐧': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Penguin/3D/penguin_3d.png',
  '🐸': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Frog/3D/frog_3d.png',
  '🥕': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Carrot/3D/carrot_3d.png',
  '💰': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Money%20bag/3D/money_bag_3d.png',
  '📏': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Straight%20ruler/3D/straight_ruler_3d.png',
  '🪟': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Window/3D/window_3d.png',
  '💎': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Gem%20stone/3D/gem_stone_3d.png',
  '🍳': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Cooking/3D/cooking_3d.png',
  '🚿': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Shower/3D/shower_3d.png',
  '🪵': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Wood/3D/wood_3d.png',
  '💧': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Droplet/3D/droplet_3d.png',
  '🧼': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Soap/3D/soap_3d.png',
  '🍱': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Bento%20box/3D/bento_box_3d.png',
  '🔥': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Fire/3D/fire_3d.png',
  '🚽': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Toilet/3D/toilet_3d.png',
  '🚉': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Station/3D/station_3d.png',
  '😍': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Smiling%20face%20with%20heart-eyes/3D/smiling_face_with_heart-eyes_3d.png',
  '😎': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Smiling%20face%20with%20sunglasses/3D/smiling_face_with_sunglasses_3d.png',
  '🙈': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/See-no-evil%20monkey/3D/see-no-evil_monkey_3d.png',
  '💖': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkling%20heart/3D/sparkling_heart_3d.png',
  '🏠': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/House/3D/house_3d.png',
  '👥': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Busts%20in%20silhouette/3D/busts_in_silhouette_3d.png',
  '📐': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Triangular%20ruler/3D/triangular_ruler_3d.png',
  '🌳': 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Deciduous%20tree/3D/deciduous_tree_3d.png',
};

/**
 * 將 Emoji 字元轉換為對應的 3D 圖片 URL
 * 修正：移除 Variation Selector-16 (0xFE0F)，提高檔名命中率
 */
export const getFluentEmojiUrl = (emoji: string): string => {
  // 優先使用鎖定的官方 CDN 網址
  if (EMOJI_DIRECT_LINKS[emoji]) {
    return EMOJI_DIRECT_LINKS[emoji];
  }

  const codePoints = Array.from(emoji)
    .map(c => c.codePointAt(0)!)
    .filter(cp => cp !== 0xFE0F) // 過濾掉隱形的變體選擇符 (VS16)
    .map(cp => cp.toString(16))
    .join('-');
    
  return `${FLUENT_EMOJI_BASE_URL}${codePoints}.png`;
};

/**
 * 產生帶有 3D Emoji 的 HTML 字串 (用於 Leaflet Tooltip)
 * 簡單加入 onerror 處理，若失敗則隱藏 (HTML string 較難做複雜 fallback)
 */
export const getFluentEmojiHtml = (emoji: string, size: number = 24): string => {
  const url = getFluentEmojiUrl(emoji);
  // 若圖片載入失敗，顯示原始 Emoji (利用 alt 屬性與 onerror)
  // 注意：在 innerHTML 中 onerror 可能較難完美運作顯示 alt 文字，這裡盡量嘗試顯示圖片
  return `<img src="${url}" alt="${emoji}" style="width: ${size}px; height: ${size}px; display: inline-block; vertical-align: middle; margin: 0 2px;" crossorigin="anonymous" onerror="this.style.display='none'; this.outerHTML='<span style=\\'font-size:${size}px; line-height:1\\'>${emoji}</span>'" />`;
};

interface FluentEmojiProps {
  emoji: string;
  size?: number;
  className?: string;
}

/**
 * 單個 3D Emoji 元件
 * 新增：載入失敗時自動降級為原始文字 Emoji
 */
export const FluentEmoji: React.FC<FluentEmojiProps> = ({ emoji, size = 18, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const url = getFluentEmojiUrl(emoji);
  
  return (
    <span 
      className={`relative inline-block align-middle select-none ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Text Emoji Fallback (Visible until image loads or if error) */}
      {(!isLoaded || hasError) && (
        <span 
          className="absolute inset-0 flex items-center justify-center leading-none" 
          style={{ fontSize: size * 0.8 }}
          role="img" 
          aria-label={emoji}
        >
          {emoji}
        </span>
      )}
      
      {/* 3D Image */}
      {!hasError && emoji && (
        <img 
          src={url} 
          alt={emoji}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </span>
  );
};

interface TextWithFluentEmojisProps {
  text: string;
  className?: string;
  emojiSize?: number;
}

/**
 * 自動將文字中的所有 Emoji 替換為 3D 版本
 */
export const TextWithFluentEmojis: React.FC<TextWithFluentEmojisProps> = ({ text, className = '', emojiSize = 16 }) => {
  if (!text) return null;

  // Regex to match emojis (包含擴展集)
  const emojiRegex = /([\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]+)/gu;

  const parts = text.split(emojiRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(emojiRegex)) {
          return <FluentEmoji key={index} emoji={part} size={emojiSize} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
