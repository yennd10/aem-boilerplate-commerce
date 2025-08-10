import { readBlockConfig } from "../../scripts/aem.js";
import { getSkuFromUrl, fetchIndex } from "../../scripts/commerce.js";
import { loadFragment } from "../fragment/fragment.js";

export default async function decorate(block) {
  try {
    const type = block.dataset.type || "product";
    const filters = {};

    if (type === "product") {
      const productSku = getSkuFromUrl();
      if (!productSku) {
        console.log("No product SKU found in URL - using test mode");
        // For testing, use a sample product SKU
        filters.products = "sample-product-1";
      } else {
        filters.products = productSku;
      }
    }

    if (type === "category") {
      const plpBlock = document.querySelector(".block.product-list-page");
      if (!plpBlock) {
        console.log("No product list page block found - using test mode");
        // For testing, use a sample category
        filters.categories = "sample-category-1";
      } else {
        const category =
          plpBlock.dataset?.category || readBlockConfig(plpBlock).category;
        if (!category) {
          console.log("No category ID found - using test mode");
          filters.categories = "sample-category-1";
        } else {
          filters.categories = category;
        }
      }
    }

    console.log("Enrichment filters:", filters);

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

    console.log("Enrichment index data:", index.data);

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
              console.log(`Fragment missing ${filterKey}:`, fragment);
              return false;
            }

            // Safely parse JSON with error handling
            const values = JSON.parse(fragment[filterKey]);
            const matches =
              Array.isArray(values) && values.includes(filters[filterKey]);
            console.log(`Filter ${filterKey}:`, {
              values,
              filter: filters[filterKey],
              matches,
            });
            return matches;
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

    console.log("Matching fragments:", matchingFragments);

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
