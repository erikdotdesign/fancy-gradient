import { scaleAndPositionNode } from "./helpers";

figma.showUI(__html__, { themeColors: true, width: 600, height: 536 });

const saveToStorage = async (key: string, value: any) => {
  await figma.clientStorage.setAsync(key, value);
};

const loadFromStorage = async (key: string) => {
  const value = await figma.clientStorage.getAsync(key);
  figma.ui.postMessage({ type: "storage-loaded", key, value });
};

const addVideoOrImage = async (msg: { video: string; image: string }) => {
  try {
    // Try video first
    const base64 = msg.video.split(",")[1];
    const data = figma.base64Decode(base64);
    const video = await figma.createVideoAsync(data);

    const node = figma.createRectangle();
    node.fills = [{ type: "VIDEO", scaleMode: "FILL", videoHash: video.hash }];
    node.name = "Kaleidoscope";
    scaleAndPositionNode(node, 1, 604);
    figma.currentPage.selection = [node];
  } catch {
    // Fallback to image
    const base64 = msg.image.split(",")[1];
    const data = figma.base64Decode(base64);
    const image = figma.createImage(data);

    const node = figma.createRectangle();
    node.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: image.hash }];
    node.name = "Kaleidoscope";
    scaleAndPositionNode(node, 1, 604);
    figma.currentPage.selection = [node];
    figma.notify("A Figma pro plan is required for video 😢");
  }
};

const exportSelectionAsImage = async () => {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.ui.postMessage({ type: "no-selection" });
    figma.notify("Select at least one node");
    return;
  }

  // Clone selection so we don’t affect originals
  const clones: SceneNode[] = selection.map((n) => n.clone());

  // Group if multiple
  const node =
    clones.length === 1 ? clones[0] : figma.group(clones, figma.currentPage);

  // Move the node (either the clone or the group) off-canvas
  node.x = figma.viewport.bounds.x + figma.viewport.bounds.width + 100;
  node.y = figma.viewport.bounds.y;

  try {
    const bytes = await node.exportAsync({ format: "PNG" });
    figma.ui.postMessage({
      type: "selection-image",
      image: `data:image/png;base64,${figma.base64Encode(bytes)}`,
    });
  } catch (err) {
    figma.notify("Error rasterizing selection");
    console.error(err);
  } finally {
    node.remove(); // cleanup
  }
};

const handlers: Record<string, (msg: any) => void | Promise<void>> = {
  "save-storage": (msg) => saveToStorage(msg.key, msg.value),
  "load-storage": (msg) => loadFromStorage(msg.key),
  "add-kaleidoscope": (msg) => addVideoOrImage(msg),
  "get-selection-image": () => exportSelectionAsImage(),
};

figma.ui.onmessage = async (msg) => {
  const handler = handlers[msg.type];
  if (handler) {
    await handler(msg);
  }
};