// Import extensions first
import { BoldExtension } from "./BoldExtension";
import { ItalicExtension } from "./ItalicExtension";
import { UnderlineExtension } from "./UnderlineExtension";
import { StrikethroughExtension } from "./StrikethroughExtension";
import { CodeExtension } from "./CodeExtension";
import { SuperscriptExtension } from "./SuperscriptExtension";
import { SubscriptExtension } from "./SubscriptExtension";
import { TextColorExtension } from "./TextColorExtension";
import { BackgroundColorExtension } from "./BackgroundColorExtension";
import { FontFamilyExtension } from "./FontFamilyExtension";
import { FontSizeExtension } from "./FontSizeExtension";
import { HeadingExtension } from "./HeadingExtension";
import { BlockquoteExtension } from "./BlockquoteExtension";
import { CodeBlockExtension } from "./CodeBlockExtension";
import { HorizontalRuleExtension } from "./HorizontalRuleExtension";
import { BulletListExtension } from "./BulletListExtension";
import { OrderedListExtension } from "./OrderedListExtension";
import { LinkExtension } from "./LinkExtension";
import { AutoLinkExtension } from "./AutoLinkExtension";
import { ImageExtension } from "./ImageExtension";
import { ClipboardExtension } from "./ClipboardExtension";
import { TableExtension } from "./TableExtension";
import { TextAlignmentExtension } from "./TextAlignmentExtension";

// Basic text formatting
export { BoldExtension };
export { ItalicExtension };
export { UnderlineExtension };
export { StrikethroughExtension };
export { CodeExtension };
export { SuperscriptExtension };
export { SubscriptExtension };

// Color and font formatting
export { TextColorExtension };
export { BackgroundColorExtension };
export { FontFamilyExtension };
export { FontSizeExtension };

// Block elements
export { HeadingExtension };
export { BlockquoteExtension };
export { CodeBlockExtension };
export { HorizontalRuleExtension };
export { BulletListExtension };
export { OrderedListExtension };

// Interactive elements
export { LinkExtension };
export { AutoLinkExtension };
export { ImageExtension };
export { ClipboardExtension };
export { TableExtension };
export { TextAlignmentExtension };

// Extension presets
export const BasicExtensions = [
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  StrikethroughExtension,
  CodeExtension,
];

export const FormattingExtensions = [
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  StrikethroughExtension,
  CodeExtension,
  SuperscriptExtension,
  SubscriptExtension,
  TextColorExtension,
  BackgroundColorExtension,
  FontFamilyExtension,
  FontSizeExtension,
];

export const BlockExtensions = [
  HeadingExtension,
  BlockquoteExtension,
  CodeBlockExtension,
  HorizontalRuleExtension,
  BulletListExtension,
  OrderedListExtension,
];

export const InteractiveExtensions = [
  LinkExtension,
  AutoLinkExtension,
  ImageExtension,
  ClipboardExtension,
];

export const StructuralExtensions = [TableExtension, TextAlignmentExtension];

export const AllExtensions = [
  ...FormattingExtensions,
  ...BlockExtensions,
  ...InteractiveExtensions,
  ...StructuralExtensions,
];
