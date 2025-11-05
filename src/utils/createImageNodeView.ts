import { createApp, App } from "vue";
import ImageNodeView from "@/components/ImageNodeView.vue";

export function createImageNodeView(
  node: any,
  view: any,
  getPos: () => number,
) {
  const dom = document.createElement("div");
  dom.className = "image-node-view-wrapper";

  let vueApp: App | null = null;
  let vueInstance: any = null;

  const nodeView = {
    dom,
    contentDOM: null as any,

    update(newNode: any) {
      if (newNode.type !== node.type) {
        return false;
      }

      // Update the node reference
      node = newNode;

      // Update Vue component props
      if (vueInstance) {
        vueInstance.node = newNode;
      }

      return true;
    },

    selectNode() {
      if (vueInstance) {
        vueInstance.selected = true;
      }
      dom.classList.add("ProseMirror-selectednode");
    },

    deselectNode() {
      if (vueInstance) {
        vueInstance.selected = false;
      }
      dom.classList.remove("ProseMirror-selectednode");
    },

    destroy() {
      if (vueApp) {
        vueApp.unmount();
        vueApp = null;
        vueInstance = null;
      }
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    },

    ignoreMutation(mutation: MutationRecord) {
      // Ignore all mutations in the Vue component
      return !dom.contains(mutation.target) || dom === mutation.target;
    },
  };

  // Create Vue app and mount it
  vueApp = createApp(ImageNodeView, {
    node,
    view,
    getPos,
    decorations: [],
    selected: false,
  });

  // Mount the Vue component
  vueInstance = vueApp.mount(dom);

  return nodeView;
}
