// script.js — Kitchen Recipe Planner + pagination

(function () {

    var STEP_TEMPLATES = {
        smoothie: [
            { text: "Peel and chop any fruits into rough chunks — smaller pieces blend more smoothly.", tip: "Frozen fruit makes the smoothie thicker and colder without needing ice." },
            { text: "Add the fruit pieces into your blender first, then pour in the milk (or liquid base).", tip: "Always add liquid before solid ingredients to protect the blender blades." },
            { text: "Add sugar or sweetener to taste. Start with less — you can always add more.", tip: "Honey or dates work great as natural sweeteners." },
            { text: "Blend on high for 45–60 seconds until completely smooth with no chunks.", tip: "Pause and scrape down the sides halfway through if needed." },
            { text: "Taste and adjust — add more milk if too thick, more fruit if too thin.", tip: "" },
            { text: "Pour into a chilled glass and serve immediately.", tip: "Drink within 10 minutes for best flavour and nutrition." }
        ],

        milkshake: [
            { text: "Chill your glass in the freezer for 5 minutes for best results.", tip: "A cold glass keeps the shake from melting too fast." },
            { text: "Peel and slice the fruit (or measure out your flavouring) into the blender.", tip: "" },
            { text: "Add chilled milk and sugar into the blender.", tip: "Full-fat milk gives a creamier, richer shake." },
            { text: "Blend on high for 30–45 seconds until frothy and smooth.", tip: "Blend longer for a smoother texture." },
            { text: "Taste and adjust sweetness. Blend for another 10 seconds if you added anything.", tip: "" },
            { text: "Pour into your chilled glass. Serve immediately with a straw.", tip: "Top with a pinch of cinnamon or cocoa powder for extra flair." }
        ],

        omelette: [
            { text: "Crack the eggs into a bowl. Add a pinch of salt and pepper.", tip: "Room temperature eggs beat more evenly than cold ones." },
            { text: "Beat the eggs briskly with a fork until the yolks and whites are fully combined and slightly frothy.", tip: "Don't over-beat — stop when you see small bubbles." },
            { text: "Chop all vegetables and other fillings into small, even pieces.", tip: "Small pieces cook through faster and distribute better in the egg." },
            { text: "Heat a non-stick pan over medium heat. Add oil or butter and let it melt and coat the pan.", tip: "The butter should foam but not turn brown — that's the right temperature." },
            { text: "If using onions or other raw vegetables, sauté them in the pan for 2–3 minutes until softened.", tip: "" },
            { text: "Pour in the beaten eggs. Tilt the pan gently to spread the egg mixture evenly.", tip: "Don't stir — let the bottom set for about 30 seconds." },
            { text: "As the edges set, use a spatula to gently push them toward the centre, letting uncooked egg flow to the edges.", tip: "" },
            { text: "When the top is just barely set (still slightly glossy), add any cheese or fillings to one half.", tip: "Don't wait until fully dry — a slightly soft centre means a fluffy omelette." },
            { text: "Fold the omelette in half over the fillings and slide onto a plate.", tip: "Serve immediately — omelettes toughen quickly as they cool." }
        ],

        fried_rice: [
            { text: "If cooking fresh rice, prepare it and spread it on a tray to cool for at least 15 minutes. Day-old rice works best.", tip: "Cold, dry rice fries better — freshly cooked rice can get mushy." },
            { text: "Chop all vegetables, proteins, and aromatics (garlic, onion) into small pieces.", tip: "Keep everything ready before you heat the pan — stir frying moves fast." },
            { text: "Heat a wok or large pan on high heat until it begins to smoke slightly. Add oil and swirl to coat.", tip: "High heat is essential for fried rice — it creates the slightly smoky 'wok breath' flavour." },
            { text: "Add garlic or onion first and stir fry for 30 seconds until fragrant.", tip: "" },
            { text: "Add proteins (chicken, egg, paneer) and cook through, stirring constantly.", tip: "For egg: push everything to the side, scramble the egg in the empty space, then mix in." },
            { text: "Add vegetables and stir fry for 2 minutes on high heat.", tip: "" },
            { text: "Add the rice, breaking up any clumps with your spatula. Toss everything together.", tip: "Press the rice against the hot pan briefly to get slight crispiness." },
            { text: "Drizzle soy sauce around the edges of the pan (not directly on rice) and toss to coat evenly.", tip: "Adding sauce to the hot pan edge lets it caramelise slightly before mixing in." },
            { text: "Taste and adjust salt and soy sauce. Garnish with spring onions if available.", tip: "" }
        ],

        sandwich: [
            { text: "Lay out your bread slices and optionally toast them for extra crunch.", tip: "Toasting prevents the bread from going soggy from fillings." },
            { text: "If using butter or spreads (mayo, mustard), spread them on both inner sides of the bread.", tip: "Butter the edges right to the corners for even coverage." },
            { text: "Prepare your fillings — slice vegetables thinly, shred or slice any protein.", tip: "Thin, even slices stack better and give you filling in every bite." },
            { text: "Layer heavier ingredients (meat, paneer, egg) on the bottom slice first.", tip: "" },
            { text: "Add vegetables and lighter toppings on top of the protein layer.", tip: "Wet ingredients like tomato go in the middle, away from the bread, to reduce sogginess." },
            { text: "Season with salt, pepper, or any spices you prefer.", tip: "" },
            { text: "Place the top slice and press down gently. Cut diagonally for easier eating.", tip: "Cutting diagonally gives more surface area and makes every bite more satisfying." }
        ],

        soup: [
            { text: "Chop all vegetables into similar-sized pieces so they cook evenly.", tip: "Bite-sized chunks (about 2cm) work well for most soups." },
            { text: "Heat oil in a deep pot over medium heat. Add onion and garlic, sauté for 3–4 minutes until soft and golden.", tip: "This base layer adds depth to the entire soup." },
            { text: "Add any harder vegetables (carrots, beans) and stir for 2 minutes.", tip: "" },
            { text: "Pour in water or stock — enough to cover vegetables by about 5cm.", tip: "Stock adds much more flavour than plain water." },
            { text: "Bring to a boil, then reduce heat to a gentle simmer.", tip: "Simmering (not boiling) keeps the soup clear and prevents vegetables from breaking apart." },
            { text: "Add softer vegetables and any proteins. Season with salt and pepper.", tip: "" },
            { text: "Simmer for 12–15 minutes until all vegetables are tender when pierced with a fork.", tip: "" },
            { text: "Taste and adjust seasoning. For a smoother soup, blend partially with a stick blender.", tip: "Add a squeeze of lemon at the end to brighten the flavours." },
            { text: "Ladle into bowls and serve hot.", tip: "" }
        ],

        pasta: [
            { text: "Bring a large pot of water to a rolling boil. Add a generous pinch of salt — it should taste like the sea.", tip: "Well-salted pasta water is the single biggest flavour upgrade you can make." },
            { text: "Cook the pasta according to package instructions, stirring occasionally. Aim for al dente (firm to the bite).", tip: "Taste a piece 1–2 minutes before the suggested time — it should have a tiny bit of bite." },
            { text: "Before draining, reserve a cup of pasta water. Then drain the pasta.", tip: "Pasta water is starchy gold — it helps sauce cling to the pasta." },
            { text: "While pasta cooks, heat oil in a pan over medium heat. Sauté garlic for 1 minute until fragrant.", tip: "" },
            { text: "Add your main sauce ingredients (tomatoes, cream, vegetables, or protein) and cook for 5–8 minutes.", tip: "Crush canned tomatoes with the back of a spoon for a smoother sauce." },
            { text: "Add the drained pasta directly into the sauce pan. Toss to coat.", tip: "Add a splash of reserved pasta water to loosen the sauce if needed." },
            { text: "Finish with grated cheese, fresh herbs, or a drizzle of olive oil.", tip: "Turn off the heat before adding cheese to prevent it from becoming stringy." },
            { text: "Serve immediately in warm bowls.", tip: "" }
        ],

        stir_fry: [
            { text: "Prep all ingredients before turning on the heat — slice proteins thinly, chop vegetables uniformly.", tip: "Stir frying is fast; there's no time to chop once you start." },
            { text: "Mix your sauce in a small bowl: soy sauce, a splash of water, and any spices.", tip: "Having the sauce ready means you won't burn anything while searching for ingredients." },
            { text: "Heat wok or pan on highest heat for 2 minutes. Add oil and swirl.", tip: "The pan must be screaming hot before anything goes in." },
            { text: "Add aromatics (garlic, ginger, onion) and toss for 30 seconds.", tip: "" },
            { text: "Add proteins in a single layer. Let them sear for 1 minute without stirring, then toss.", tip: "Letting it sit creates a nice sear rather than steaming the meat." },
            { text: "Add harder vegetables first (carrot, capsicum), toss for 2 minutes.", tip: "" },
            { text: "Add softer vegetables and pour the sauce around the edges of the pan.", tip: "" },
            { text: "Toss everything together for 1 more minute. The sauce should thicken slightly and coat everything.", tip: "Don't overcook — vegetables should stay vibrant and have a little crunch." },
            { text: "Serve immediately over rice or noodles.", tip: "" }
        ],

        toast: [
            { text: "Slice bread if not pre-sliced, to your preferred thickness.", tip: "Thicker slices hold up better to heavy toppings." },
            { text: "Toast in a toaster or on a pan over medium heat until golden on both sides.", tip: "For pan toasting, a little butter gives you a crispy, flavourful crust." },
            { text: "While still hot, spread butter from edge to edge — it melts in beautifully.", tip: "Cold butter tears bread; let it soften slightly first." },
            { text: "Add any additional toppings (garlic, cheese, spreads).", tip: "" },
            { text: "Serve immediately while warm and crispy.", tip: "" }
        ],

        egg: [
            { text: "Crack eggs into a bowl first to check for shell fragments — then transfer to pan or recipe.", tip: "Never crack directly into a hot pan." },
            { text: "Heat pan over medium heat. Add butter or oil.", tip: "Medium heat is key — too high and the edges burn before the centre sets." },
            { text: "Cook eggs as directed, seasoning with salt and pepper.", tip: "" },
            { text: "Remove from heat just before they look fully done — residual heat finishes the cooking.", tip: "This prevents rubbery, overcooked eggs." },
            { text: "Plate and serve immediately.", tip: "" }
        ],

        default: [
            { text: "Gather and measure all your ingredients before starting.", tip: "Having everything prepped ('mise en place') makes cooking faster and less stressful." },
            { text: "Prep your ingredients — wash, peel, chop, or slice as needed.", tip: "Uniform sizes mean even cooking." },
            { text: "Heat your pan or pot over medium heat and add oil or butter.", tip: "Wait until the oil shimmers before adding ingredients." },
            { text: "Cook ingredients in order of how long they take — longest first.", tip: "" },
            { text: "Season with salt and pepper throughout cooking, not just at the end.", tip: "Layering seasoning builds more complex flavour." },
            { text: "Taste as you go and adjust seasoning, texture, and consistency.", tip: "" },
            { text: "Plate and serve while hot. Garnish with fresh herbs if available.", tip: "A squeeze of lemon or lime brightens almost any savoury dish." }
        ]
    };

    var currentQuery = "";
    var currentOffset = 0;
    var currentSource = "";
    var isLoading = false;

    function getStepTemplate(name, stepsText) {
        var combined = (name + " " + stepsText).toLowerCase();

        if (combined.match(/smoothie/)) return STEP_TEMPLATES.smoothie;
        if (combined.match(/milkshake|milk shake|shake/)) return STEP_TEMPLATES.milkshake;
        if (combined.match(/omelette|omelet/)) return STEP_TEMPLATES.omelette;
        if (combined.match(/fried rice/)) return STEP_TEMPLATES.fried_rice;
        if (combined.match(/sandwich|wrap/)) return STEP_TEMPLATES.sandwich;
        if (combined.match(/soup/)) return STEP_TEMPLATES.soup;
        if (combined.match(/pasta|macaroni/)) return STEP_TEMPLATES.pasta;
        if (combined.match(/stir.?fry|stir fry/)) return STEP_TEMPLATES.stir_fry;
        if (combined.match(/toast|bread.*butter|garlic bread/)) return STEP_TEMPLATES.toast;
        if (combined.match(/egg|scramble|boil.*egg|fry.*egg/)) return STEP_TEMPLATES.egg;
        return STEP_TEMPLATES.default;
    }

    function buildSteps(name, stepsValue, ingredients, isAiGenerated) {
        if (isAiGenerated) {
            if (Array.isArray(stepsValue) && stepsValue.length > 0) {
                return stepsValue.map(function (step) {
                    return { text: step, tip: "" };
                });
            }

            if (typeof stepsValue === "string" && stepsValue.trim()) {
                var cleaned = stepsValue.replace(/\r/g, "\n").trim();

                var parts = cleaned
                    .split(/\n|(?=Step\s*\d+\.?)/i)
                    .map(function (s) { return s.trim(); })
                    .filter(Boolean)
                    .map(function (s) {
                        return s.replace(/^Step\s*\d+\.?\s*/i, "").trim();
                    });

                return parts.map(function (step) {
                    return { text: step, tip: "" };
                });
            }
        }

        var template = getStepTemplate(name, typeof stepsValue === "string" ? stepsValue : "");
        var ingList = ingredients.map(function (i) {
            return i.charAt(0).toUpperCase() + i.slice(1);
        }).join(", ");

        return template.map(function (s, idx) {
            if (idx === 0) {
                return {
                    text: "Gather and measure all your ingredients: " + ingList + ".",
                    tip: s.tip
                };
            }
            return { text: s.text, tip: s.tip };
        });
    }

    function openRecipe(name, time, ingredients, steps, isAiGenerated) {
        document.getElementById("emptyState").style.display = "none";
        var view = document.getElementById("recipeView");
        view.classList.add("show");

        document.getElementById("rName").textContent = name;
        document.getElementById("rTime").textContent = time;

        var ingsEl = document.getElementById("rIngs");
        ingsEl.innerHTML = "";
        ingredients.forEach(function (ing) {
            var pill = document.createElement("div");
            pill.className = "ing-pill";
            pill.textContent = ing.charAt(0).toUpperCase() + ing.slice(1);
            ingsEl.appendChild(pill);
        });

        var stepsEl = document.getElementById("rSteps");
        stepsEl.innerHTML = "";
        var detailed = buildSteps(name, steps, ingredients, isAiGenerated);

        detailed.forEach(function (s, i) {
            var div = document.createElement("div");
            div.className = "step";
            div.style.animationDelay = (i * 0.06) + "s";

            var numEl = document.createElement("div");
            numEl.className = "step-num";
            numEl.textContent = String(i + 1).padStart(2, "0");

            var bodyEl = document.createElement("div");
            bodyEl.className = "step-body";

            var textEl = document.createElement("div");
            textEl.className = "step-text";
            textEl.textContent = s.text;
            bodyEl.appendChild(textEl);

            if (s.tip) {
                var tipEl = document.createElement("span");
                tipEl.className = "step-tip";
                tipEl.textContent = "💡 " + s.tip;
                bodyEl.appendChild(tipEl);
            }

            div.appendChild(numEl);
            div.appendChild(bodyEl);
            stepsEl.appendChild(div);
        });

        document.getElementById("rightPanel").scrollTop = 0;
    }

    function closeRecipe() {
        document.getElementById("recipeView").classList.remove("show");
        document.getElementById("emptyState").style.display = "flex";
    }

    function showTyping() {
        var feed = document.getElementById("feed");
        hideTyping();

        var el = document.createElement("div");
        el.className = "typing-wrap";
        el.id = "typing";
        el.innerHTML = '<div class="av">✦</div><div class="typing"><span></span><span></span><span></span></div>';
        feed.appendChild(el);
        feed.scrollTop = feed.scrollHeight;
    }

    function hideTyping() {
        var el = document.getElementById("typing");
        if (el) el.remove();
    }

    function removeLoadMore() {
        var el = document.getElementById("loadMoreWrap");
        if (el) el.remove();
    }

    function addBotMessage(html) {
        var feed = document.getElementById("feed");
        var div = document.createElement("div");
        div.className = "msg-bot";
        div.innerHTML = '<div class="av">✦</div><div class="bbl">' + html + '</div>';
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
    }

    function addRecipeCard(recipe, i) {
        var feed = document.getElementById("feed");

        var wrap = document.createElement("div");
        wrap.className = "recipe-row";
        wrap.style.animationDelay = (i * 0.08) + "s";

        var ingTags = (recipe.ingredients || []).map(function (ing) {
            return '<span>' + ing.charAt(0).toUpperCase() + ing.slice(1) + '</span>';
        }).join("");

        var btn = document.createElement("button");
        btn.className = "cook-btn";
        btn.innerHTML = recipe.ai_generated
            ? "✦ Cook this <span style='font-size:10px;opacity:.7;'>(AI)</span>"
            : "✦ Cook this";

        btn.addEventListener("click", function () {
            openRecipe(
                recipe.name,
                recipe.time,
                recipe.ingredients || [],
                recipe.steps || [],
                !!recipe.ai_generated
            );
        });

        var cardDiv = document.createElement("div");
        cardDiv.className = "rcard";
        cardDiv.innerHTML =
            '<div class="rcard-top">' +
            '<div class="rcard-name">' + recipe.name + '</div>' +
            '<div class="rcard-time">⏱ ' + recipe.time + '</div>' +
            '</div>' +
            '<div class="rcard-ings">' + ingTags + '</div>';

        cardDiv.appendChild(btn);

        var avDiv = document.createElement("div");
        avDiv.className = "av";
        avDiv.style.cssText = "background:#f3ede4;color:var(--accent);";
        avDiv.textContent = "🍽";

        wrap.appendChild(avDiv);
        wrap.appendChild(cardDiv);
        feed.appendChild(wrap);
        feed.scrollTop = feed.scrollHeight;
    }

    function addLoadMoreButton() {
        removeLoadMore();

        var feed = document.getElementById("feed");
        var wrap = document.createElement("div");
        wrap.className = "load-more-wrap";
        wrap.id = "loadMoreWrap";

        var btn = document.createElement("button");
        btn.className = "load-more-btn";
        btn.textContent = "Load 5 more";
        btn.addEventListener("click", function () {
            loadMoreRecipes();
        });

        wrap.appendChild(btn);
        feed.appendChild(wrap);
        feed.scrollTop = feed.scrollHeight;
    }

    function normalizeResponse(data) {
        if (Array.isArray(data)) {
            return {
                source: "local",
                recipes: data,
                total: data.length,
                offset: 0,
                next_offset: data.length,
                has_more: false
            };
        }
        return data || {};
    }

    function renderRecipes(data, isFirstBatch) {
        var feed = document.getElementById("feed");
        removeLoadMore();

        if (data.response) {
            addBotMessage(data.response);
            return;
        }

        if (!data.recipes || data.recipes.length === 0) {
            addBotMessage("Hmm, I couldn’t find anything for those ingredients. Try a different combination!");
            return;
        }

        if (isFirstBatch) {
            if (data.source === "local") {
                addBotMessage(
                    'Found <b>' + data.total + ' recipe' + (data.total > 1 ? 's' : '') +
                    '</b>. Showing <b>5 at a time</b> — click <b>Load 5 more</b> to see more.'
                );
            } else if (data.source === "ai") {
                addBotMessage(
                    'I couldn’t find a strong local match, so I generated these using <b>AI</b>. Click <b>Cook this</b> to open the full guide.'
                );
            }
        }

        data.recipes.forEach(function (recipe, i) {
            addRecipeCard(recipe, i);
        });

        currentOffset = data.next_offset || 0;
        currentSource = data.source || "";

        if (data.has_more && currentSource === "local") {
            addLoadMoreButton();
        } else if (!data.has_more && currentSource === "local" && !isFirstBatch) {
            addBotMessage("That’s all the matching recipes I found.");
        }

        feed.scrollTop = feed.scrollHeight;
    }

    function sendMessage() {
        var inputEl = document.getElementById("userInput");
        var text = inputEl.value.trim();
        if (!text || isLoading) return;

        currentQuery = text;
        currentOffset = 0;
        currentSource = "";
        isLoading = true;

        removeLoadMore();

        var feed = document.getElementById("feed");
        var uDiv = document.createElement("div");
        uDiv.className = "msg-user";
        uDiv.innerHTML = '<div class="bbl">' + text + '</div>';
        feed.appendChild(uDiv);
        feed.scrollTop = feed.scrollHeight;

        inputEl.value = "";
        showTyping();

        fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, offset: 0 })
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                hideTyping();
                renderRecipes(normalizeResponse(data), true);
            })
            .catch(function () {
                hideTyping();
                addBotMessage("Something went wrong. Please try again.");
            })
            .finally(function () {
                isLoading = false;
            });
    }

    function loadMoreRecipes() {
        if (!currentQuery || isLoading) return;

        isLoading = true;
        removeLoadMore();
        showTyping();

        fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: currentQuery,
                offset: currentOffset
            })
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                hideTyping();
                renderRecipes(normalizeResponse(data), false);
            })
            .catch(function () {
                hideTyping();
                addBotMessage("Couldn’t load more recipes. Please try again.");
            })
            .finally(function () {
                isLoading = false;
            });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.getElementById("sendBtn").addEventListener("click", sendMessage);
        document.getElementById("userInput").addEventListener("keydown", function (e) {
            if (e.key === "Enter") sendMessage();
        });
        document.getElementById("closeRecipeBtn").addEventListener("click", closeRecipe);
        document.querySelectorAll(".chip").forEach(function (chip) {
            chip.addEventListener("click", function () {
                document.getElementById("userInput").value = chip.getAttribute("data-fill");
                sendMessage();
            });
        });
    });

})();