import { toPlainJson } from '@/lib/utils/plain-json'
import type { Block, FooterBlockProps, HeaderBlockProps } from '@/features/your-space/types'

export type ChromeBlockType = 'header' | 'footer'

export type ChromeBlockProps = HeaderBlockProps | FooterBlockProps

/**
 * Replace props on every root-level header/footer block. Headers/footers are root-only.
 */
export function applyChromePropsToBlocks(
  blocks: Block[],
  chromeType: ChromeBlockType,
  props: ChromeBlockProps
): { blocks: Block[]; updatedCount: number } {
  const nextProps = toPlainJson(props) as ChromeBlockProps
  let updatedCount = 0

  const nextBlocks = blocks.map(block => {
    if (block.type !== chromeType) {
      return block
    }

    updatedCount += 1

    return {
      ...block,
      props: nextProps
    } as Block
  })

  return { blocks: nextBlocks, updatedCount }
}
