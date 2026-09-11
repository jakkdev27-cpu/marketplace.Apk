package com.marketplace.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SlugUtilsTest {

    @Test
    void slugifiesFrenchText() {
        assertEquals("mode-homme", SlugUtils.slugify("Mode Homme !"));
        assertEquals("café-thé".replace("é", "e"), SlugUtils.slugify("Café & Thé"));
        assertEquals("item", SlugUtils.slugify("   "));
    }
}
