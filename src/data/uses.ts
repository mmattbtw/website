/**
 * Everything on /uses. An item is plain text, a link, or a group of nested
 * items. Most links are Amazon affiliate links.
 */

export interface UseItem {
  label?: string;
  text: string;
  href?: string;
  note?: string;
  children?: UseItem[];
  /** A comma-separated run of links, e.g. the software list. */
  links?: { text: string; href: string }[];
}

export interface UseSection {
  heading: string;
  items: UseItem[];
}

export const updated = "2/20/2025";

export const sections: UseSection[] = [
  {
    heading: "desktop pc",
    items: [
      { label: "CPU", text: "Intel i9-9900K", href: "https://amzn.to/3ZTsX4G" },
      { label: "RAM", text: "Corsair Vengence Pro 32GB 3200 MHz", href: "https://amzn.to/4fG1p8I" },
      { label: "GPU", text: "RTX 2070", href: "https://amzn.to/4gFUopY" },
      { label: "OS", text: "Windows 11 (with Ubuntu WSL)" },
      {
        label: "Storage",
        text: "",
        children: [
          { label: "NVME", text: "WD_BLACK: 1TB", href: "https://amzn.to/40f2PTi" },
          { label: "SSD", text: "WD Blue: 1TB", href: "https://amzn.to/4i2qq05" },
        ],
      },
      {
        label: "Keyboard",
        text: "Keychron V3 QMK, with Keychron K Pro Red switches",
        href: "https://www.keychron.com/products/keychron-v3-qmk-custom-mechanical-keyboard",
      },
      { label: "Mouse", text: "Finalmouse Starlight-12 (Gold) - 400 DPI" },
      { label: "Headphones", text: "PHILIPS SHP9500", href: "https://amzn.to/4gAaJwk" },
      { label: "Desktop Speakers", text: "Edifier R1280DB", href: "https://amzn.to/400wZZ3" },
      { label: "Microphone", text: "Elgato Wave:3", href: "https://amzn.to/3PkMNRG" },
      { label: "Microphone Arm", text: "Elgato Wave Mic Arm LP", href: "https://amzn.to/3PiaIAT" },
      {
        text: "Elgato Stream Deck: MK.1",
        href: "https://amzn.to/4gCDFUr",
        note: "(linking the MK.2 because appearently the MK.1 is 'unsupported' or whatever.......... but it works just fine, so if you can find a used one for a good price I say go for it, the differences between the MK.1 and the MK.2 are negligible.)",
      },
      { label: "Webcam", text: "Elgato Facecam MK.2", href: "https://amzn.to/41WlxQE" },
      { label: "Capture Card", text: "Elgato HD60 S+", href: "https://amzn.to/402YbXd" },
      {
        label: "Benchmark",
        text: "Click Here",
        href: "https://www.userbenchmark.com/UserRun/69065736",
      },
      { text: "CS:GO Settings", href: "https://settings.gg/player/166736678" },
    ],
  },
  {
    heading: "laptop",
    items: [
      {
        label: "Model",
        text: "Apple Macbook Air (Late 2020) - M1",
        href: "https://amzn.to/4iS6b61",
      },
      { label: "CPU", text: "Apple M1" },
      { label: "GPU", text: "8 Core GPU from M1" },
      { label: "RAM", text: "16GB" },
      { label: "Storage", text: "", children: [{ label: "SSD", text: "500GB" }] },
      { label: "OS", text: "macOS Sequoia" },
    ],
  },
  {
    heading: "daily mobile devices",
    items: [
      {
        label: "Phone",
        text: "iPhone 16 Pro (128gb, Desert Titanium)",
        href: "https://amzn.to/41X8xKF",
      },
      {
        label: "Watch",
        text: "Apple Watch Series 7 (41mm, Starlight, GPS + Cellular)",
        href: "https://amzn.to/41YO3kY",
      },
      { label: "Headphones", text: "AirPods Pro 2", href: "https://amzn.to/40hXs5R" },
    ],
  },
  {
    heading: "homelab NAS",
    items: [
      { label: "CPU", text: "Intel i7-6700 CPU @ 3.40GHz", href: "https://amzn.to/3X9BiAJ" },
      { label: "RAM", text: "16GB 2400 MHz" },
      { label: "GPU", text: "GTX 1060 3GB", href: "https://amzn.to/4i4OKOg" },
      {
        label: "OS",
        text: "TrueNAS Scale (ElectricEel-24.10.2)",
        href: "https://www.truenas.com/truenas-scale?via=mmatt.net",
      },
      {
        label: "Storage",
        text: "",
        children: [
          { label: "Boot Drive", text: "Crucial P3: 500GB", href: "https://amzn.to/437jVEh" },
          { label: "SSD (Unused)", text: "Crucial MX500: 1TB", href: "https://amzn.to/4baxUey" },
          { label: "HDD", text: "Seagate IronWolf: 4TB", href: "https://amzn.to/4bcNVk5" },
        ],
      },
      {
        label: "Software Running",
        text: "",
        links: [
          { text: "File Browser", href: "https://filebrowser.org?via=mmatt.net" },
          { text: "Gitea", href: "https://git.mmatt.net/" },
          { text: "Home Assistant", href: "https://www.home-assistant.io?via=mmatt.net" },
          { text: "Immich", href: "https://immich.app?via=mmatt.net" },
          { text: "Jackett", href: "https://github.com/Jackett/Jackett?via=mmatt.net" },
          { text: "Jellyfin", href: "https://jellyfin.org?via=mmatt.net" },
          { text: "Pi-hole", href: "https://pi-hole.net?via=mmatt.net" },
          { text: "Portainer", href: "https://www.portainer.io?via=mmatt.net" },
          { text: "Radarr", href: "https://radarr.video?via=mmatt.net" },
          { text: "Sonarr", href: "https://sonarr.tv?via=mmatt.net" },
          { text: "Tailscale", href: "https://tailscale.com?via=mmatt.net" },
        ],
      },
    ],
  },
  {
    heading: "consoles",
    items: [
      {
        text: "Xbox 360 w/ Kinect",
        href: "https://amzn.to/4j1PDIE",
        note: "(I can't believe this is still sold on Amazon)",
      },
      { text: "Wii U", href: "https://amzn.to/4j23yyG" },
      { text: "Xbox One", href: "https://amzn.to/4a09kfP" },
      { text: "PlayStation 4", href: "https://amzn.to/4iV6cG9" },
      { text: "Nintendo Switch", href: "https://amzn.to/49XMhm3" },
      { text: "PlayStation 5", href: "https://amzn.to/4fKTXJs" },
    ],
  },
];
