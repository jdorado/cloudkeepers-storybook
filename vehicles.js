export function vehicleArt(type) {
  const parts = {
    bridge:
      '<path d="M15 85Q130 135 245 85" fill="none" stroke="#886644" stroke-width="5"/><path d="M20 58Q130 110 240 58" fill="none" stroke="#a68b61" stroke-width="4"/>' +
      Array.from(
        { length: 12 },
        (_, i) =>
          `<path d="M${20 + i * 20} ${75 + Math.sin((i / 11) * Math.PI) * 31}v20" stroke="#d4ae76" stroke-width="16"/><path d="M${20 + i * 20} ${60 + Math.sin((i / 11) * Math.PI) * 47}v30" stroke="#8b7655" stroke-width="2"/>`,
      ).join(""),
    zeppelin:
      '<path d="m218 45 28-21-2 29 14 21-39-1" fill="#648774"/><ellipse cx="125" cy="64" rx="105" ry="45" fill="url(#vehicle-green)"/><path d="M125 20c-50 13-51 77 0 89m0-89c50 13 51 77 0 89" fill="none" stroke="#e6cf9d" stroke-width="8"/><path d="m81 101 13 30m79-30-9 30" stroke="#6b6950" stroke-width="3"/><path d="M86 126h90l-10 22H99Z" fill="url(#vehicle-gold)"/><rect x="109" y="122" width="12" height="10" rx="3" fill="#558778"/><rect x="129" y="122" width="12" height="10" rx="3" fill="#558778"/>',
    boat: '<path d="M35 110h190l-36 36H65Z" fill="url(#vehicle-gold)"/><path d="M123 25v90" stroke="#897156" stroke-width="5"/><path d="m117 28-67 70h67Zm12 0v70h66Z" fill="url(#vehicle-green)"/><path d="M30 151q25-15 50 0t50 0t50 0t50 0" fill="none" stroke="#acc7bc" stroke-width="6"/>',
    balloon:
      '<path d="M75 93c-60-75 50-126 92-72 25 32-4 62-35 89Z" fill="url(#vehicle-green)"/><path d="M118 5c-22 20-24 59-8 99m18-99c26 22 32 58 6 99" stroke="#e8cda0" stroke-width="8" fill="none"/><path d="m89 105 14 33m38-33-8 33" stroke="#8a7758" stroke-width="3"/><path d="M92 133h53v27H92Z" fill="url(#vehicle-gold)"/>',
    glider:
      '<path d="M15 85 130 25 245 85 145 70 130 128 115 70Z" fill="url(#vehicle-green)" stroke="#507968" stroke-width="3"/><path d="M130 25v112m-35-77 35 55 35-55" stroke="#e6c489" stroke-width="4"/><circle cx="130" cy="130" r="12" fill="#e6c489"/>',
    kite: '<path d="m130 12 72 65-72 65-72-65Z" fill="url(#vehicle-green)"/><path d="m130 12v130M58 77h144" stroke="#efd4a0" stroke-width="4"/><path d="M130 142q-35 5-15 17t-5 16" stroke="#d2aa73" stroke-width="4" fill="none"/><path d="m102 155 16-8v16Z" fill="#dfa18a"/>',
    sled: '<path d="M50 99h160v27H50Z" fill="url(#vehicle-gold)"/><path d="m65 123-9 22m137-22 11 22M34 143h172q30 0 20-30" fill="none" stroke="#819e94" stroke-width="7"/><path d="M160 98V55h31l12 44" fill="#93b49b"/><path d="m35 88 15 15m-24-23 8 8" stroke="#ebe6c7" stroke-width="4"/>',
    plane:
      '<path d="m42 91 170-12q35 6 0 22L45 105 25 60h27Z" fill="url(#vehicle-green)"/><path d="m111 87-25-58h35l37 58m-47 13-25 44h35l37-44" fill="url(#vehicle-gold)"/><ellipse cx="232" cy="90" rx="4" ry="34" fill="#8d8d67"/><circle cx="180" cy="85" r="12" fill="#e8e7bf"/>',
    wings:
      '<ellipse cx="85" cy="66" rx="66" ry="25" transform="rotate(22 85 66)" fill="#d5e8ce" stroke="#87a98c" stroke-width="3"/><ellipse cx="180" cy="66" rx="66" ry="25" transform="rotate(-22 180 66)" fill="#d5e8ce" stroke="#87a98c" stroke-width="3"/><ellipse cx="95" cy="118" rx="52" ry="20" transform="rotate(-22 95 118)" fill="#b9d5b6"/><ellipse cx="170" cy="118" rx="52" ry="20" transform="rotate(22 170 118)" fill="#b9d5b6"/><path d="M130 47v105" stroke="#bb9a60" stroke-width="18" stroke-linecap="round"/>',
    rocket:
      '<path d="M100 116c-18-66 30-103 30-103s48 37 30 103Z" fill="url(#vehicle-green)"/><circle cx="130" cy="70" r="18" fill="#fff0b7" stroke="#d2ac6f" stroke-width="6"/><path d="m99 95-27 35h36m54-35 27 35h-36" fill="url(#vehicle-gold)"/><path d="M112 120q18 64 36 0" fill="#f3d591"/>',
    rainbow:
      '<path d="M20 142a110 110 0 0 1 220 0" fill="none" stroke="#dca698" stroke-width="18"/><path d="M39 142a91 91 0 0 1 182 0" fill="none" stroke="#dfc589" stroke-width="17"/><path d="M57 142a73 73 0 0 1 146 0" fill="none" stroke="#a5c396" stroke-width="17"/><path d="M75 142a55 55 0 0 1 110 0" fill="none" stroke="#a7c6c7" stroke-width="17"/>',
    beacon:
      '<path d="m102 150 13-85h30l13 85Z" fill="url(#vehicle-gold)"/><path d="m100 64 30-35 30 35Z" fill="#789a80"/><rect x="111" y="59" width="38" height="31" rx="9" fill="#fff0ac"/><path d="m130 49 10-21m-28 28-22-13m60 13 22-13" stroke="#ffe7a0" stroke-width="5" stroke-linecap="round"/>',
  };
  return `<svg class="airship" viewBox="0 0 260 175" role="img" aria-label="${type} transport"><defs><linearGradient id="vehicle-green" x2="0" y2="1"><stop stop-color="#d9ead0"/><stop offset="1" stop-color="#6e9c85"/></linearGradient><linearGradient id="vehicle-gold" x2="0" y2="1"><stop stop-color="#f1d5a0"/><stop offset="1" stop-color="#bf9459"/></linearGradient></defs>${parts[type] || parts.zeppelin}</svg>`;
}
