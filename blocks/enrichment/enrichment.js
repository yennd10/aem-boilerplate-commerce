import { readBlockConfig } from "../../scripts/aem.js";
import { getSkuFromUrl, fetchIndex } from "../../scripts/commerce.js";
import { loadFragment } from "../fragment/fragment.js";

export default async function decorate(block) {
  const { type, position } = readBlockConfig(block);

  try {
    const filters = {};

    if (type === "product") {
      const productSku = getSkuFromUrl();
      if (!productSku) {
        throw new Error("No product SKU found in URL");
      }
      filters.products = productSku;
    }

    if (type === "category") {
      const plpBlock = document.querySelector(".block.product-list-page");
      if (!plpBlock) {
        throw new Error("No product list page block found");
      }

      const category =
        plpBlock.dataset?.category || readBlockConfig(plpBlock).category;
      if (!category) {
        throw new Error("No category ID found in product list page block");
      }
      filters.categories = category;
    }

    if (position) {
      filters.positions = position;
    }

    const index = await fetchIndex("enrichment/enrichment");

    // Check if index and index.data exist
    if (!index || !index.data || !Array.isArray(index.data)) {
      console.warn("Enrichment index not found or invalid format");
      return;
    }

    // Check if there's any data in the index
    if (index.data.length === 0) {
      console.log("Enrichment index is empty - no fragments available");
      return;
    }

    const matchingFragments = index.data
      .filter((fragment) => {
        // Validate fragment exists and has required properties
        if (!fragment || typeof fragment !== "object") {
          return false;
        }

        return Object.keys(filters).every((filterKey) => {
          try {
            // Check if fragment has the filterKey property
            if (!fragment[filterKey]) {
              return false;
            }

            // Safely parse JSON with error handling
            const values = JSON.parse(fragment[filterKey]);
            return Array.isArray(values) && values.includes(filters[filterKey]);
          } catch (parseError) {
            console.warn(
              `Failed to parse JSON for filter key "${filterKey}":`,
              parseError
            );
            return false;
          }
        });
      })
      .map((fragment) => fragment.path)
      .filter(Boolean); // Remove any undefined paths

    if (matchingFragments.length === 0) {
      console.log("No matching enrichment fragments found for current filters");
      return;
    }

    (await Promise.all(matchingFragments.map((path) => loadFragment(path))))
      .filter((fragment) => fragment)
      .forEach((fragment) => {
        const sections = fragment.querySelectorAll(":scope .section");

        // If only single section, replace block with content of section
        if (sections.length === 1) {
          block.closest(".section").classList.add(...sections[0].classList);
          const wrapper = block.closest(".enrichment-wrapper");
          if (wrapper && wrapper.parentNode) {
            Array.from(sections[0].children).forEach((child) =>
              wrapper.parentNode.insertBefore(child, wrapper)
            );
          }
        } else if (sections.length > 1) {
          // If multiple sections, insert them after section of block
          const blockSection = block.closest(".section");
          if (blockSection && blockSection.parentNode) {
            Array.from(sections)
              .reverse()
              .forEach((section) =>
                blockSection.parentNode.insertBefore(
                  section,
                  blockSection.nextSibling
                )
              );
          }
        }
      });
  } catch (error) {
    console.error("Enrichment block error:", error);
  } finally {
    const wrapper = block.closest(".enrichment-wrapper");
    if (wrapper) {
      wrapper.remove();
    }
  }
}
