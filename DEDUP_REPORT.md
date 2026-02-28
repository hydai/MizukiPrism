# Song Name Standardization Report

Generated: 2026-03-01
Total songs: 3,183 | Total performances: 5,125

## Summary

| Category | Groups | Songs | Default |
|----------|--------|-------|---------|
| A: Exact title + same artist | 526 | 1235 | accept |
| B: Fuzzy title match | 67 | 164 | skip (review) |
| C: Same title, different artists | 251 | 704 | informational |

## How to use this report

1. Review groups below. Each has a **suggested canonical** title + artist.
2. Edit `tools/dedup_decisions.json` to change decisions:
   - `"accept"` → apply the canonical name to all songs in the group
   - `"skip"` → leave unchanged
   - `"override"` → set custom `canonical_title` / `canonical_artist`
3. Run `python3 tools/apply_standardization.py --dry-run` to preview.
4. Run `python3 tools/apply_standardization.py` to apply.

---

## Category A: Exact Title + Same Artist (526 groups, 1235 songs)

Same title (case-insensitive) and same/similar artist after normalization.
**Default: accept** — standardize to canonical name.

### A-0001: "-ERROR" (4 entries, 6 perfs)
**Canonical**: "-ERROR" by niki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1531 | -ERROR | niki | 2 |
| song-585 | -ERROR | niki-Lily | 2 |
| song-296 | -ERROR | Niki | 1 |
| song-2657 | -ERROR | niki (with 浠Mizuki) | 1 |

### A-0002: "1925" (2 entries, 2 perfs)
**Canonical**: "1925" by T-POCKET

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-802 | 1925 | T-POCKET | 1 |
| song-2289 | 1925 | T-POCKET（ショコラビット） | 1 |

### A-0003: "1・2・3" (3 entries, 3 perfs)
**Canonical**: "1・2・3" by After the Rain

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1008 | 1・2・3 | After the Rain | 1 |
| song-2193 | １・２・３ | After the Rain | 1 |
| song-2872 | 1・2・3 | After the Rain | 1 |

### A-0004: "21 Guns" (2 entries, 2 perfs)
**Canonical**: "21 Guns" by Green Day

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1354 | 21  Guns | Green Day | 1 |
| song-2712 | 21 Guns | Green Day | 1 |

### A-0005: "22" (2 entries, 6 perfs)
**Canonical**: "22" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2328 | 22 | Taylor Swift | 5 |
| song-2168 | 22 | Taylor Swift | 1 |

### A-0006: "8月31日" (2 entries, 2 perfs)
**Canonical**: "8月31日" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-897 | 8月31日 | DECO*27 (with 唄姆拉奇亞) | 1 |
| song-2129 | 8月31日 | DECO*27 | 1 |

### A-0007: "A Million Dreams" (3 entries, 3 perfs)
**Canonical**: "A Million Dreams" by The Greatest Showman

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-499 | A Million Dreams | The Greatest Showman Cast | 1 |
| song-1814 | A Million Dreams | The Greatest Showman | 1 |
| song-2710 | A Million Dreams | The Greatest Snowman | 1 |

### A-0008: "A Million Dreams" (3 entries, 4 perfs)
**Canonical**: "A Million Dreams" by Ziv Zaifman

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1014 | A Million Dreams | Ziv Zaifman | 2 |
| song-725 | A Million Dreams | Ziv Zaifman-Hugh Jackman-Michelle Williams | 1 |
| song-2373 | A Million Dreams | Ziv Zaifman & Hugh Jackman & Michelle Williams | 1 |

### A-0009: "A Thousand Years" (3 entries, 12 perfs)
**Canonical**: "A Thousand Years" by Christina Perri

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-125 | A Thousand Years | Christina Perri | 9 |
| song-1473 | A Thousand Years | Christina Perri | 2 |
| song-2976 | a thousand years | Christina Perri | 1 |

### A-0010: "A Whole New World" (2 entries, 2 perfs)
**Canonical**: "A Whole New World" by Mena Massoud,Naomi Scott

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-446 | A whole new world | Mena Massoud,Naomi Scott | 1 |
| song-1813 | A Whole New World | Mena Massoud, Naomi Scott | 1 |

### A-0011: "ADAMAS" (3 entries, 4 perfs)
**Canonical**: "ADAMAS" by LiSA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-704 | ADAMAS | LiSA | 2 |
| song-1668 | ADAMAS | LiSA | 1 |
| song-1940 | ADAMAS | LISA | 1 |

### A-0012: "aLIEz" (4 entries, 6 perfs)
**Canonical**: "aLIEz" by 澤野弘之

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-176 | aLIEz | 澤野弘之 | 3 |
| song-20 | aLIEz | 澤野弘之 | 1 |
| song-895 | aLIEz | 澤野弘之 (with 15號) | 1 |
| song-3005 | aLIEz | 澤野弘之 | 1 |

### A-0013: "All I Want for Christmas Is You" (2 entries, 3 perfs)
**Canonical**: "All I Want for Christmas Is You" by Mariah Carey

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-329 | All I Want for Christmas Is You | Mariah Carey | 2 |
| song-1083 | All I Want For Christmas Is You | Mariah Carey | 1 |

### A-0014: "Always Remember Us This Way" (2 entries, 5 perfs)
**Canonical**: "Always Remember Us This Way" by Lady Gaga

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1350 | Always Remember Us This Way | Lady Gaga | 4 |
| song-1356 | Always remember us this Way | Lady Gaga | 1 |

### A-0015: "APT." (2 entries, 2 perfs)
**Canonical**: "APT." by ROSÉ & Bruno Mars

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2615 | APT. | ROSÉ & Bruno Mars (with 唐牛ミラ) | 1 |
| song-2929 | APT. | ROSÉ & Bruno Mars | 1 |

### A-0016: "Arrietty's Song" (2 entries, 2 perfs)
**Canonical**: "Arrietty's Song" by セシル・コルベル

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2239 | Arrietty’s Song | セシル・コルベル | 1 |
| song-2526 | Arrietty's Song | セシル・コルベル | 1 |

### A-0017: "Asphyxia" (2 entries, 3 perfs)
**Canonical**: "Asphyxia" by Cö shu Nie

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-168 | Asphyxia | Cö shu Nie | 2 |
| song-2953 | asphyxia | Cö shu Nie | 1 |

### A-0018: "AUTUMN LEAVES" (2 entries, 2 perfs)
**Canonical**: "AUTUMN LEAVES" by Laura Fygi

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-3033 | AUTUMN LEAVES | Laura Fygi | 1 |
| song-3069 | Autumn Leaves | Laura Fygi | 1 |

### A-0019: "Back To December" (2 entries, 2 perfs)
**Canonical**: "Back To December" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2180 | Back To December | Taylor Swift | 1 |
| song-2581 | Back to December | Taylor Swift | 1 |

### A-0020: "Bad Day" (3 entries, 5 perfs)
**Canonical**: "Bad Day" by Daniel Robert Powter

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-791 | Bad Day | Daniel Powter | 3 |
| song-474 | BAD DAY | Daniel Robert Powter | 1 |
| song-3070 | Bad Day | Daniel Robert Powter | 1 |

### A-0021: "bad guy" (2 entries, 4 perfs)
**Canonical**: "bad guy" by Billie Eilish

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-638 | Bad Guy | Billie Eilish | 2 |
| song-2305 | bad guy | Billie Eilish | 2 |

### A-0022: "Bad Romance" (2 entries, 3 perfs)
**Canonical**: "Bad Romance" by Lady Gaga

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-519 | Bad Romance | Lady Gaga | 2 |
| song-1783 | bad romance | Lady Gaga | 1 |

### A-0023: "Bang Bang" (5 entries, 8 perfs)
**Canonical**: "Bang Bang" by Jessie J-Ariana Grande-Nicki Minaj

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-614 | Bang Bang | Jessie J-Ariana Grande-Nicki Minaj | 3 |
| song-2726 | Bang Bang | Jessie J, Ariana Grande, Nicki Minaj | 2 |
| song-2439 | Bang Bang | Jessie J & Ariana Grande & Nicki Minaj | 1 |
| song-2039 | Bang Bang | Jessie J | 1 |
| song-2671 | Bang Bang | Jessie J ft. Ariana Grande, Nicki Minaj | 1 |

### A-0024: "Be Crazy for me" (3 entries, 3 perfs)
**Canonical**: "Be Crazy for me" by EIKO Starring 96猫

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1580 | Be Crazy for me | EIKO Starring 96猫 | 1 |
| song-2194 | Be crazy for me | EIKO Starring 96猫 | 1 |
| song-2807 | Be Crazy For Me | EIKO Starring 96猫 | 1 |

### A-0025: "Beauty And A Beat" (2 entries, 2 perfs)
**Canonical**: "Beauty And A Beat" by Justin Bieber

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1709 | Beauty And A Beat | Justin Bieber ft.Nicki Minaj | 1 |
| song-2369 | Beauty And A Beat | Justin Bieber | 1 |

### A-0026: "Believer" (2 entries, 8 perfs)
**Canonical**: "Believer" by Imagine Dragons

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-503 | Believer | Imagine Dragons | 7 |
| song-1675 | Believer | Imagine Dragons | 1 |

### A-0027: "Best Part" (4 entries, 9 perfs)
**Canonical**: "Best Part" by Daniel Caesar

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1972 | Best Part | Daniel Caesar | 4 |
| song-1056 | Best Part | Daniel Caesar & H.E.R. | 3 |
| song-2974 | best part | Daniel Caesar & H.E.R. | 1 |
| song-1831 | Best part | Daniel Caesar | 1 |

### A-0028: "Blank Space" (3 entries, 6 perfs)
**Canonical**: "Blank Space" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1834 | Blank Space | Taylor Swift | 4 |
| song-2170 | Blank Space | Taylor Swift | 1 |
| song-2614 | Blank space | Taylor Swift (with 梨亞卓恩) | 1 |

### A-0029: "Bling-Bang-Bang-Born" (2 entries, 4 perfs)
**Canonical**: "Bling-Bang-Bang-Born" by Creepy Nuts

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2277 | Bling-Bang-Bang-Born | Creepy Nuts | 3 |
| song-2074 | Bling-Bang-bang-Born | Creepy Nuts | 1 |

### A-0030: "blue" (2 entries, 5 perfs)
**Canonical**: "blue" by Elina

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1037 | blue | Elina | 3 |
| song-1414 | Blue | Elina | 2 |

### A-0031: "Bunny Girl" (4 entries, 6 perfs)
**Canonical**: "Bunny Girl" by AKASAKI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-300 | Bunny Girl | AKASAKI | 3 |
| song-2610 | BUNNY GIRL | AKASAKI | 1 |
| song-2800 | bunny girl | AKASAKI | 1 |
| song-2725 | Bunny Girl | AKSAKI | 1 |

### A-0032: "Calc." (5 entries, 13 perfs)
**Canonical**: "Calc." by ジミーサムP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1236 | Calc. | ジミーサムP | 9 |
| song-129 | Calc. | ジミーサムP feat.初音ミク | 1 |
| song-1671 | Calc. | ジミーサムP feat.初音ミク | 1 |
| song-951 | calc. | ジミーサムP | 1 |
| song-2761 | Calc. | ジミーサムP ft. 初音ミク | 1 |

### A-0033: "Can You Feel the Love Tonight" (3 entries, 6 perfs)
**Canonical**: "Can You Feel the Love Tonight" by Elton John

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-42 | Can You Feel the Love Tonight | Elton John | 4 |
| song-1738 | Can You Feel The Love Tonight | Elton John | 1 |
| song-1925 | Can you feel the love tonight | Elton John | 1 |

### A-0034: "Can't Help Falling in Love" (3 entries, 7 perfs)
**Canonical**: "Can't Help Falling in Love" by Elvis Presley

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-246 | Can't Help Falling in Love | Elvis Presley | 4 |
| song-1057 | Can't Help Falling In Love | Elvis Presley | 2 |
| song-1415 | can't help falling in love | Elvis Presley | 1 |

### A-0035: "CH4NGE" (2 entries, 2 perfs)
**Canonical**: "CH4NGE" by ギガP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-259 | CH4NGE | ギガP | 1 |
| song-1066 | CH4NGE | ギガP | 1 |

### A-0036: "champagne problems" (2 entries, 3 perfs)
**Canonical**: "champagne problems" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2182 | champagne problems | Taylor Swift | 2 |
| song-3051 | champagne problems | Taylor Swift | 1 |

### A-0037: "Cheap Thrills" (2 entries, 3 perfs)
**Canonical**: "Cheap Thrills" by Sia

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1341 | Cheap Thrills | Sia | 2 |
| song-1716 | Cheap Thrills | Sia -  ft. Sean Paul | 1 |

### A-0038: "City of stars" (2 entries, 3 perfs)
**Canonical**: "City of stars" by Ryan Gosling & Emma Stone

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1954 | City of stars | Ryan Gosling & Emma Stone | 2 |
| song-1903 | City Of Stars | Ryan Gosling & Emma Stone | 1 |

### A-0039: "Closer" (2 entries, 4 perfs)
**Canonical**: "Closer" by The Chainsmokers

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-930 | Closer | The Chainsmokers | 2 |
| song-2814 | Closer | The Chainsmokers ft. Halsey | 2 |

### A-0040: "Clover wish" (2 entries, 2 perfs)
**Canonical**: "Clover wish" by ChamJam

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2127 | Clover wish | ChamJam | 1 |
| song-2873 | Clover Wish | ChamJam | 1 |

### A-0041: "Complicated" (2 entries, 5 perfs)
**Canonical**: "Complicated" by Avril Lavigne

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1049 | Complicated | Avril Lavigne | 4 |
| song-1764 | Complicated | Avril Lavigne | 1 |

### A-0042: "Creep" (2 entries, 2 perfs)
**Canonical**: "Creep" by Radiohead

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1070 | Creep | Radiohead | 1 |
| song-1296 | Creep | Radiohead | 1 |

### A-0043: "Cruel Summer" (2 entries, 2 perfs)
**Canonical**: "Cruel Summer" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2165 | Cruel Summer | Taylor Swift | 1 |
| song-2333 | Cruel Summer | Taylor Swift | 1 |

### A-0044: "Cupid" (2 entries, 2 perfs)
**Canonical**: "Cupid" by FIFTY FIFTY

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2107 | Cupid | FIFTY FIFTY | 1 |
| song-3060 | CUPID | FIFTY FIFTY | 1 |

### A-0045: "Dancing Queen" (2 entries, 3 perfs)
**Canonical**: "Dancing Queen" by ABBA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2406 | Dancing Queen | ABBA | 2 |
| song-3001 | Dancing Queen | ABBA | 1 |

### A-0046: "Day by Day" (7 entries, 18 perfs)
**Canonical**: "Day by Day" by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-351 | Day by Day | 浠Mizuki | 12 |
| song-1601 | Day by day | 浠Mizuki | 1 |
| song-1771 | day by day | 浠Mizuki | 1 |
| song-1942 | day by day | 浠Mizuki | 1 |
| song-2650 | Day by Day | 浠Mizuki (with 浠Mizuki) | 1 |
| song-3026 | Day by Day | 浠Mizuki | 1 |
| song-2721 | Day By Day | 浠 Mizuki | 1 |

### A-0047: "Daylight" (2 entries, 3 perfs)
**Canonical**: "Daylight" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2407 | Daylight | Taylor Swift | 2 |
| song-2183 | Daylight | Taylor Swift | 1 |

### A-0048: "Dear John" (2 entries, 3 perfs)
**Canonical**: "Dear John" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1643 | Dear John | Taylor Swift | 2 |
| song-3123 | Dear John | Taylor Swift | 1 |

### A-0049: "Delicate" (2 entries, 3 perfs)
**Canonical**: "Delicate" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2833 | Delicate | Taylor Swift | 2 |
| song-2174 | Delicate | Taylor Swift | 1 |

### A-0050: "Despair" (2 entries, 5 perfs)
**Canonical**: "Despair" by luz

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1856 | Despair | luz | 4 |
| song-3054 | despair | luz | 1 |

### A-0051: "Dried flower" (2 entries, 2 perfs)
**Canonical**: "Dried flower" by 優里

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2086 | Dried flower | 優里 | 1 |
| song-2209 | Dried Flower | 優里 | 1 |

### A-0052: "drop pop candy" (3 entries, 3 perfs)
**Canonical**: "drop pop candy" by れをる & ギガP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1212 | drop pop candy | れをる-ギガP | 1 |
| song-1629 | drop pop candy | れをる & ギガP | 1 |
| song-2885 | drop pop candy | れをる & ギガP | 1 |

### A-0053: "drunk" (2 entries, 3 perfs)
**Canonical**: "drunk" by keshi

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1504 | drunk | keshi | 2 |
| song-1826 | drunk | keshi | 1 |

### A-0054: "Dum Dum" (2 entries, 3 perfs)
**Canonical**: "Dum Dum" by Jeff Satur

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-313 | Dum Dum | Jeff Satur | 2 |
| song-2678 | dum dum | Jeff Satur | 1 |

### A-0055: "Enchanted" (2 entries, 4 perfs)
**Canonical**: "Enchanted" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2020 | Enchanted | Taylor Swift | 3 |
| song-2169 | Enchanted | Taylor Swift | 1 |

### A-0056: "Everything will be Ok" (3 entries, 3 perfs)
**Canonical**: "Everything will be Ok" by 王OK & 李天責

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2063 | Everything will be Ok | 王OK & 李天責 | 1 |
| song-2495 | Everything Will Be OK | 王OK & 李天責 | 1 |
| song-3019 | Everything will be OK | 王OK & 李天責 | 1 |

### A-0057: "EYE" (2 entries, 2 perfs)
**Canonical**: "EYE" by Kanaria

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-878 | EYE | Kanaria (with 祈菈‧貝希毛絲) | 1 |
| song-1247 | EYE | Kanaria | 1 |

### A-0058: "Fairytale, [reunion]" (3 entries, 3 perfs)
**Canonical**: "Fairytale, [reunion]" by buzzG

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1855 | Fairytale, [reunion] | buzzG feat.GUMI | 1 |
| song-2428 | Fairytale, [reunion] | buzzG | 1 |
| song-2769 | Fairytale, [reunion] | buzz ft. GUMI | 1 |

### A-0059: "Fall in Love" (4 entries, 5 perfs)
**Canonical**: "Fall in Love" by 九九 & 陳忻玥

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2901 | Fall in Love | 九九 & 陳忻玥 | 2 |
| song-1749 | Fall in Love | 九九 & 陳忻玥 | 1 |
| song-2461 | Fall in love | 九九 & 陳忻玥 | 1 |
| song-2641 | Fall in love | 九九 & 陳忻玥 (with TSMATCH火柴) | 1 |

### A-0060: "Fall in Love" (2 entries, 2 perfs)
**Canonical**: "Fall in Love" by 九九 Sophie Chen x 陳忻玥 Vicky Chen

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1969 | Fall in Love | 九九 Sophie Chen x 陳忻玥 Vicky Chen | 1 |
| song-2979 | Fall in love | 九九 Sophie Chen x 陳忻玥 Vicky Chen | 1 |

### A-0061: "Fearless" (2 entries, 2 perfs)
**Canonical**: "Fearless" by HOYO-MiX, YMIR (煌Kirali)

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2173 | Fearless | HOYO-MiX, YMIR (煌Kirali) | 1 |
| song-3157 | Fearless | HOYO-MiX, YMIR (煌Kirali) | 1 |

### A-0062: "Feel Like Makin' Love" (2 entries, 2 perfs)
**Canonical**: "Feel Like Makin' Love" by Roberta Flack

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-3003 | Feel Like Makin' Love | Roberta Flack | 1 |
| song-3127 | Feel Like Makin' Love | Roberta Flack | 1 |

### A-0063: "Femme Fatale" (2 entries, 2 perfs)
**Canonical**: "Femme Fatale" by ヒプノシスマイク

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-257 | Femme Fatale | ヒプノシスマイク 中王区 | 1 |
| song-1914 | Femme Fatale | ヒプノシスマイク | 1 |

### A-0064: "Femme Fatale" (2 entries, 2 perfs)
**Canonical**: "Femme Fatale" by 中王区

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1822 | Femme Fatale | 中王区 言の葉党 | 1 |
| song-2440 | Femme Fatale | 中王区 | 1 |

### A-0065: "Fix You" (2 entries, 3 perfs)
**Canonical**: "Fix You" by Coldplay

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1570 | Fix You | Coldplay | 2 |
| song-2978 | Fix you | Coldplay | 1 |

### A-0066: "Flashlight" (2 entries, 5 perfs)
**Canonical**: "Flashlight" by Jessie J

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-535 | Flashlight | Jessie J | 4 |
| song-1946 | flashlight | Jessie J | 1 |

### A-0067: "flos" (4 entries, 10 perfs)
**Canonical**: "flos" by R Sound Design

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1290 | flos | R Sound Design | 6 |
| song-609 | Flos | R Sound Design | 2 |
| song-399 | flos | R Sound Design feat.初音ミク | 1 |
| song-892 | Flos | R Sound Design (with 哈瓜) | 1 |

### A-0068: "Fly Me To The Moon" (3 entries, 4 perfs)
**Canonical**: "Fly Me To The Moon" by Bart Howard

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-947 | Fly Me To The Moon | Bart Howard | 2 |
| song-2223 | Fly me to the moon | Bart Howard | 1 |
| song-2238 | Fly Me to the Moon | Bart Howard | 1 |

### A-0069: "Fly Me To The Moon" (3 entries, 3 perfs)
**Canonical**: "Fly Me To The Moon" by Frank Sinatra

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1540 | Fly Me To The Moon | Frank Sinatra | 1 |
| song-2853 | Fly Me to the Moon | Frank Sinatra & Count Basie | 1 |
| song-2972 | fly me to the moon | francis sinatra | 1 |

### A-0070: "GETCHA" (2 entries, 2 perfs)
**Canonical**: "GETCHA" by Giga&KIRA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-419 | GETCHA | Giga&KIRA | 1 |
| song-1775 | Getcha | Giga&KIRA | 1 |

### A-0071: "GETCHA!" (3 entries, 5 perfs)
**Canonical**: "GETCHA!" by Giga & KIRA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-89 | GETCHA! | Giga & KIRA | 3 |
| song-889 | GETCHA! | Giga&KIRA (with 洛可洛斯特) | 1 |
| song-1821 | GETCHA! | Giga&KIRA | 1 |

### A-0072: "Gimme×Gimme" (3 entries, 4 perfs)
**Canonical**: "Gimme×Gimme" by 八王子P × Giga

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1587 | Gimme×Gimme | 八王子P × Giga | 2 |
| song-1115 | Gimme×Gimme | 八王子P-Giga | 1 |
| song-2892 | Gimme×Gimme | 八王子P & Giga | 1 |

### A-0073: "glow" (5 entries, 8 perfs)
**Canonical**: "glow" by keeno

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-365 | glow | keeno | 3 |
| song-603 | GLOW | keeno | 2 |
| song-121 | glow | Keeno feat.初音ミクDark | 1 |
| song-1460 | glow | keeno | 1 |
| song-2765 | glow | keeno  ft. 初音ミク | 1 |

### A-0074: "Golden" (2 entries, 2 perfs)
**Canonical**: "Golden" by HUNTR/X

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-38 | Golden | HUNTR/X | 1 |
| song-3063 | Golden | HUNTR/X | 1 |

### A-0075: "golden hour" (2 entries, 8 perfs)
**Canonical**: "golden hour" by JVKE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1865 | golden hour | JVKE | 7 |
| song-2758 | Golden Hour | JVKE | 1 |

### A-0076: "Good Goodbye" (2 entries, 4 perfs)
**Canonical**: "Good Goodbye" by ONE OK ROCK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-564 | Good Goodbye | ONE OK ROCK | 3 |
| song-1359 | Good goodbye | ONE OK ROCK | 1 |

### A-0077: "Hail To The King" (2 entries, 2 perfs)
**Canonical**: "Hail To The King" by Avenged Sevenfold

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-544 | Hail To The King | Avenged Sevenfold | 1 |
| song-3093 | Hail to the King | Avenged Sevenfold Future | 1 |

### A-0078: "Happy Halloween" (2 entries, 2 perfs)
**Canonical**: "Happy Halloween" by Junky

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-469 | Happy Halloween | Junky | 1 |
| song-1011 | Happy Halloween | Junky | 1 |

### A-0079: "Hate me (Sometimes)" (2 entries, 2 perfs)
**Canonical**: "Hate me (Sometimes)" by Stand Atlantic

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2999 | Hate me (Sometimes) | Stand Atlantic | 1 |
| song-3096 | Hate Me (Sometimes) | Stand Atlantic | 1 |

### A-0080: "Havana" (2 entries, 2 perfs)
**Canonical**: "Havana" by Camila Cabello

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-13 | Havana | Camila Cabello | 1 |
| song-1544 | Havana | Camila Cabello - ft. Young Thug | 1 |

### A-0081: "Heartache" (2 entries, 6 perfs)
**Canonical**: "Heartache" by ONE OK ROCK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-565 | Heartache | ONE OK ROCK | 5 |
| song-893 | Heartache | ONE OK ROCK (with 阿爾姿) | 1 |

### A-0082: "Hearts" (2 entries, 3 perfs)
**Canonical**: "Hearts" by niki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-680 | Hearts | niki | 2 |
| song-407 | Hearts | niki feat.Lily | 1 |

### A-0083: "Henceforth" (3 entries, 6 perfs)
**Canonical**: "Henceforth" by Orangestar

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-679 | Henceforth | Orangestar | 4 |
| song-2307 | henceforth | Orangestar | 1 |
| song-1517 | Henceforth | Orangestar feat.IA | 1 |

### A-0084: "Hero too" (2 entries, 3 perfs)
**Canonical**: "Hero too" by KYOKA JIRO Starring Chrissy Costanza

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2153 | Hero too | KYOKA JIRO Starring Chrissy Costanza | 2 |
| song-169 | Hero too | 耳郎響香 Starring Chrissy Costanza | 1 |

### A-0085: "I Ain't Worried" (3 entries, 5 perfs)
**Canonical**: "I Ain't Worried" by OneRepublic

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2211 | I Ain't Worried | OneRepublic | 3 |
| song-2079 | I Ain't Worried | OneRepublic | 1 |
| song-2815 | I Ain’t Worried | OneRepublic | 1 |

### A-0086: "I Forgot That You Existed" (2 entries, 2 perfs)
**Canonical**: "I Forgot That You Existed" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2164 | I Forgot That You Existed | Taylor Swift | 1 |
| song-2523 | I Forgot That You Existed | Taylor Swift | 1 |

### A-0087: "I Love You 3000" (2 entries, 7 perfs)
**Canonical**: "I Love You 3000" by Stephanie Poetri

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1508 | I Love You 3000 | Stephanie Poetri | 6 |
| song-1596 | I Love You 3000 | Stephanie Poetri | 1 |

### A-0088: "I See the Light" (4 entries, 5 perfs)
**Canonical**: "I See the Light" by Mandy Moore & Zachary Levi

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1896 | I See The Light | Mandy Moore & Zachary Levi | 2 |
| song-756 | I See the Light | Mandy Moore, Zachary Levi-Clark on Stage | 1 |
| song-1589 | I see the light | Mandy Moore & Zachary Levi | 1 |
| song-2056 | I See the Light | Mandy Moore & Zachary Levi | 1 |

### A-0089: "I Wanna Be Your Slave" (2 entries, 3 perfs)
**Canonical**: "I Wanna Be Your Slave" by Måneskin

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-71 | I Wanna Be Your Slave | Måneskin | 2 |
| song-2713 | I Wanna Be Your Slave | MÅNESKIN | 1 |

### A-0090: "I'm still alive today" (3 entries, 5 perfs)
**Canonical**: "I'm still alive today" by 96猫

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-835 | I'm still alive today | 96猫 | 3 |
| song-2623 | I'm still alive today | 96猫 (with 歐妲) | 1 |
| song-2652 | I'm still alive today | 96猫 (with 浠Mizuki) | 1 |

### A-0091: "If I Ain't Got You" (2 entries, 4 perfs)
**Canonical**: "If I Ain't Got You" by Alicia Keys

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2033 | If I Ain't Got You | Alicia Keys | 3 |
| song-1830 | if i ain't got you | Alicia Keys | 1 |

### A-0092: "If I Were A Boy" (2 entries, 2 perfs)
**Canonical**: "If I Were A Boy" by Beyoncé

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-40 | If I Were A Boy | Beyoncé | 1 |
| song-2484 | If I Were a Boy | Beyoncé | 1 |

### A-0093: "Jump Up Super Star!" (2 entries, 2 perfs)
**Canonical**: "Jump Up Super Star!" by Super Mario Odyssey

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-613 | Jump Up Super Star! | Super Mario Odyssey | 1 |
| song-1575 | Jump Up Super Star! | Super Mario Odyssey | 1 |

### A-0094: "Just Be Friends" (3 entries, 4 perfs)
**Canonical**: "Just Be Friends" by Dixie Flatline

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1843 | Just Be Friends | Dixie Flatline | 2 |
| song-132 | Just Be Friends | DixieFlatline feat.巡音ルカ | 1 |
| song-2296 | Just Be Friends | DixieFlatline | 1 |

### A-0095: "Just The Way You Are" (3 entries, 7 perfs)
**Canonical**: "Just The Way You Are" by Bruno Mars

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1218 | Just The Way You Are | Bruno Mars | 4 |
| song-687 | Just the Way You Are | Bruno Mars | 2 |
| song-1665 | Just the way you are | Bruno Mars | 1 |

### A-0096: "Keep Cold" (5 entries, 7 perfs)
**Canonical**: "Keep Cold" by Numcha

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1139 | Keep Cold | Numcha | 2 |
| song-1474 | Keep Cold | Numcha | 2 |
| song-51 | KEEP COLD | Numcha | 1 |
| song-1952 | keep cold | Numcha | 1 |
| song-3008 | Keep cold | Numcha | 1 |

### A-0097: "KING" (2 entries, 8 perfs)
**Canonical**: "KING" by Kanaria

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-471 | KING | Kanaria | 7 |
| song-2376 | KING | kanaria | 1 |

### A-0098: "KINGS" (2 entries, 3 perfs)
**Canonical**: "KINGS" by angela-atsuko-KATSU

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1215 | KINGS | angela-atsuko-KATSU | 2 |
| song-2714 | Kings | Angela | 1 |

### A-0099: "Kiss Me" (2 entries, 2 perfs)
**Canonical**: "Kiss Me" by Sixpence None The Richer

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2845 | Kiss Me | Sixpence None The Richer | 1 |
| song-2965 | kiss me | Sixpence None The Richer | 1 |

### A-0100: "Last Christmas" (2 entries, 5 perfs)
**Canonical**: "Last Christmas" by Wham!

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1100 | Last Christmas | Wham! | 4 |
| song-590 | Last Christmas | Wham! | 1 |

### A-0101: "Last Night, Good Night" (2 entries, 2 perfs)
**Canonical**: "Last Night, Good Night" by livetune

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1639 | Last Night, Good Night | livetune | 1 |
| song-1846 | Last Night, Good Night | livetune | 1 |

### A-0102: "Lemon" (2 entries, 5 perfs)
**Canonical**: "Lemon" by 米津玄師

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1143 | Lemon | 米津玄師 | 4 |
| song-1067 | Lemon | 米津玄師 | 1 |

### A-0103: "Let it be" (3 entries, 3 perfs)
**Canonical**: "Let it be" by The Beatles

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-39 | Let it be | The Beatles | 1 |
| song-1226 | Let It Be | The Beatles | 1 |
| song-1810 | Let it Be | The Beatles | 1 |

### A-0104: "Let it go" (3 entries, 4 perfs)
**Canonical**: "Let it go" by Idina Menzel

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-337 | Let It Go | Idina Menzel | 2 |
| song-235 | Let it go | Idina Menzel | 1 |
| song-1090 | Let it go | Idina Menzel | 1 |

### A-0105: "Long Live" (2 entries, 2 perfs)
**Canonical**: "Long Live" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2167 | Long Live | Taylor Swift | 1 |
| song-2752 | Long Live | Taylor Swift | 1 |

### A-0106: "Love Is an Open Door" (3 entries, 3 perfs)
**Canonical**: "Love Is an Open Door" by Kristen Bell & Santino Fontana

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-755 | Love Is an Open Door | Kristen Bell,Santino Fontana-Clark on Stage | 1 |
| song-2829 | Love Is An Open Door | Kristen Bell & Santino Fontana | 1 |
| song-2911 | Love Is an Open Door | Kristen Bell & Santino Fontana | 1 |

### A-0107: "Love Me Like You Do" (2 entries, 5 perfs)
**Canonical**: "Love Me Like You Do" by Ellie Goulding

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1151 | Love Me Like You Do | Ellie Goulding | 4 |
| song-441 | Love me like you do | Ellie Goulding | 1 |

### A-0108: "Love Story" (3 entries, 6 perfs)
**Canonical**: "Love Story" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1140 | Love Story | Taylor Swift | 4 |
| song-141 | LOVE STORY | Taylor Swift | 1 |
| song-2185 | Love Story | Taylor Swift | 1 |

### A-0109: "Love Yourself" (2 entries, 4 perfs)
**Canonical**: "Love Yourself" by Justin Bieber

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1283 | Love Yourself | Justin Bieber | 3 |
| song-1476 | Love Yourself | Justin Bieber | 1 |

### A-0110: "lovely" (3 entries, 3 perfs)
**Canonical**: "lovely" by Khalid & Billie Eilish

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2520 | lovely | Khalid & Billie Eilish | 1 |
| song-2898 | Lovely | Khalid & Billie Eilish | 1 |
| song-3049 | lovely | Billie Eilish ft. Khalid | 1 |

### A-0111: "Lover" (4 entries, 8 perfs)
**Canonical**: "Lover" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1082 | Lover | Taylor Swift | 5 |
| song-341 | LOVER | Taylor Swift | 1 |
| song-591 | Lover | Taylor Swift | 1 |
| song-2177 | Lover | Taylor Swift | 1 |

### A-0112: "magnet" (3 entries, 7 perfs)
**Canonical**: "magnet" by 流星P

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-112 | magnet | 流星P | 4 |
| song-1009 | Magnet | 流星P | 2 |
| song-2634 | magnet | 流星P (with 露熙妲) | 1 |

### A-0113: "main actor" (2 entries, 3 perfs)
**Canonical**: "main actor" by 美波

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1684 | main actor | 美波 | 2 |
| song-674 | Main Actor | 美波 | 1 |

### A-0114: "Mamma Mia" (2 entries, 4 perfs)
**Canonical**: "Mamma Mia" by Abba

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1491 | Mamma Mia | Abba | 3 |
| song-1262 | Mamma Mia | ABBA | 1 |

### A-0115: "Maps" (2 entries, 2 perfs)
**Canonical**: "Maps" by Maroon 5

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1782 | maps | Maroon 5 | 1 |
| song-2466 | Maps | Maroon 5 | 1 |

### A-0116: "ME!" (3 entries, 5 perfs)
**Canonical**: "ME!" by Taylor Swift-Brendon Boyd Urie

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1816 | ME! | Taylor Swift | 3 |
| song-1132 | ME! | Taylor Swift-Brendon Boyd Urie | 1 |
| song-2178 | ME! | Taylor Swift-Brendon Boyd Urie | 1 |

### A-0117: "Mermaid" (2 entries, 2 perfs)
**Canonical**: "Mermaid" by 浦島坂田船

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-191 | Mermaid | 浦島坂田船 | 1 |
| song-280 | Mermaid | 浦島坂田船 | 1 |

### A-0118: "Metropolis" (2 entries, 2 perfs)
**Canonical**: "Metropolis" by 劉柏辛

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1744 | Metropolis | 劉柏辛 | 1 |
| song-2510 | Metropolis | 劉柏辛 | 1 |

### A-0119: "Mojito" (2 entries, 2 perfs)
**Canonical**: "Mojito" by 周杰倫

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-857 | mojito | 周杰倫 | 1 |
| song-1543 | Mojito | 周杰倫 | 1 |

### A-0120: "Moves Like Jagger" (2 entries, 3 perfs)
**Canonical**: "Moves Like Jagger" by Maroon 5

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2701 | Moves Like Jagger | Maroon 5 | 2 |
| song-2963 | moves like jagger | maroon 5 & christina aguilera | 1 |

### A-0121: "Mr.シャーデンフロイデ" (2 entries, 2 perfs)
**Canonical**: "Mr.シャーデンフロイデ" by ひとしずく×やま△

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-233 | Mr.シャーデンフロイデ | ひとしずく×やま△ | 1 |
| song-2513 | Mr.シャーデンフロイデ | ひとしずく・やま△ | 1 |

### A-0122: "My Dearest" (4 entries, 6 perfs)
**Canonical**: "My Dearest" by Supercell

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-781 | My Dearest | Supercell | 3 |
| song-146 | MY DEAREST | Supercell | 1 |
| song-1599 | My dearest | Supercell | 1 |
| song-2637 | My Dearest | supercell (with 克蕾) | 1 |

### A-0123: "My Heart Will Go On" (4 entries, 4 perfs)
**Canonical**: "My Heart Will Go On" by Celine Dion

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-501 | My Heart Will Go On | Céline Dion | 1 |
| song-1261 | My Heart Will Go On | Celine Dion | 1 |
| song-1678 | My Heart Will Go On | Celine Dion | 1 |
| song-2137 | My heart will go on | Celine Dion | 1 |

### A-0124: "My Medicine" (2 entries, 5 perfs)
**Canonical**: "My Medicine" by The Pretty Reckless

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-324 | My Medicine | The Pretty Reckless | 4 |
| song-2851 | My Medicine | The Pretty Reckles | 1 |

### A-0125: "Nectar" (4 entries, 5 perfs)
**Canonical**: "Nectar" by まふまふ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-117 | Nectar | まふまふ | 2 |
| song-2454 | Nectar | まふまふ feat. nqrse | 1 |
| song-776 | Nectar | まふまふ-nqrse | 1 |
| song-888 | Nectar | まふまふ-nqrse (with 月城九曜) | 1 |

### A-0126: "Never Enough" (3 entries, 6 perfs)
**Canonical**: "Never Enough" by Loren Allred

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1061 | Never Enough | Loren Allred | 4 |
| song-607 | NEVER ENOUGH | Loren Allred | 1 |
| song-1781 | never enough | Loren Allred | 1 |

### A-0127: "Nightwalker" (2 entries, 3 perfs)
**Canonical**: "Nightwalker" by Ten

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2212 | Nightwalker | Ten | 2 |
| song-2515 | NIGHTWALKER | TEN | 1 |

### A-0128: "Nine point eight" (4 entries, 4 perfs)
**Canonical**: "Nine point eight" by Mili

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-158 | Nine point eight | Mili | 1 |
| song-1069 | Nine Point Eight | Mili | 1 |
| song-1235 | nine point eight | Mili | 1 |
| song-3023 | NIne Point Eight | Mili | 1 |

### A-0129: "No pain, No game" (2 entries, 2 perfs)
**Canonical**: "No pain, No game" by ナノ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1000 | No pain, No game | ナノ-塚本けむ | 1 |
| song-2344 | No pain, No game | ナノ | 1 |

### A-0130: "No.1" (2 entries, 2 perfs)
**Canonical**: "No.1" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-326 | No.1 | HoneyWorks （CV：夏川椎菜） | 1 |
| song-742 | No.1 | HoneyWorks | 1 |

### A-0131: "NON STOP SOUL!!!" (3 entries, 4 perfs)
**Canonical**: "NON STOP SOUL!!!" by Rumi 懶猫子

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-604 | NON STOP SOUL!!! | Rumi 懶猫子 | 2 |
| song-403 | NON STOP SOUL!!! | Rumi 懶貓子 | 1 |
| song-502 | NON STOP SOUL!!! | Rumi | 1 |

### A-0132: "One Life" (2 entries, 4 perfs)
**Canonical**: "One Life" by James Bay

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1551 | One Life | James Bay | 3 |
| song-2124 | One life | James Bay | 1 |

### A-0133: "One Touch" (4 entries, 5 perfs)
**Canonical**: "One Touch" by milet

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-854 | One Touch | milet | 2 |
| song-1594 | One Touch | milet | 1 |
| song-2423 | One Touch | Milet | 1 |
| song-3079 | one touch | milet | 1 |

### A-0134: "OST" (2 entries, 2 perfs)
**Canonical**: "OST" by ASH ISLAND

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-288 | OST | ASH ISLAND | 1 |
| song-2945 | OST | ASH ISLAND feat. Chanmina | 1 |

### A-0135: "Overdose" (2 entries, 5 perfs)
**Canonical**: "Overdose" by なとり

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-253 | Overdose | なとり | 4 |
| song-1454 | Overdose | なとり | 1 |

### A-0136: "Paper Rings" (2 entries, 8 perfs)
**Canonical**: "Paper Rings" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1817 | Paper Rings | Taylor Swift | 7 |
| song-2162 | Paper Rings | Taylor Swift | 1 |

### A-0137: "Part of Your World" (2 entries, 7 perfs)
**Canonical**: "Part of Your World" by Jodi Benson

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-447 | Part of Your World | Jodi Benson | 6 |
| song-879 | Part of Your World | Jodi Benson (with 歐妲) | 1 |

### A-0138: "Party In The U.S.A." (2 entries, 2 perfs)
**Canonical**: "Party In The U.S.A." by Miley Cyrus

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-766 | Party In The U.S.A. | Miley Cyrus | 1 |
| song-1051 | Party In The U.S.A. | Miley Cyru | 1 |

### A-0139: "PLATONIC GIRL" (2 entries, 4 perfs)
**Canonical**: "PLATONIC GIRL" by みきとP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-979 | PLATONIC GIRL | みきとP | 3 |
| song-860 | PLATONIC GIRL | みきとP | 1 |

### A-0140: "PLAY我呸" (2 entries, 4 perfs)
**Canonical**: "PLAY我呸" by 蔡依林

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1161 | PLAY我呸 | 蔡依林 | 3 |
| song-978 | PLAY我呸 | 蔡依林 Jolin Tsai | 1 |

### A-0141: "POP/STARS" (2 entries, 3 perfs)
**Canonical**: "POP/STARS" by K/DA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1820 | POP/STARS | K/DA | 2 |
| song-400 | POP/STARS | K/DA（Seraphine版本） | 1 |

### A-0142: "QUEEN" (2 entries, 5 perfs)
**Canonical**: "QUEEN" by Kanaria

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-972 | QUEEN | Kanaria | 4 |
| song-1992 | Queen | Kanaria | 1 |

### A-0143: "Rain On Me" (2 entries, 3 perfs)
**Canonical**: "Rain On Me" by Lady Gaga & Ariana Grande

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2241 | Rain On Me | Lady Gaga & Ariana Grande | 2 |
| song-3165 | Rain On Me | Lady Gaga, Ariana Grande (浠Mizuki＆煌Kirali) | 1 |

### A-0144: "rain stops, good-bye" (2 entries, 3 perfs)
**Canonical**: "rain stops, good-bye" by におP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1990 | rain stops, good-bye | におP | 2 |
| song-124 | Rain stops, good-bye | におP feat.初音ミク | 1 |

### A-0145: "Rainy proof" (2 entries, 5 perfs)
**Canonical**: "Rainy proof" by HACHI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2240 | Rainy proof | HACHI | 4 |
| song-3170 | Rainy proof | HACHI | 1 |

### A-0146: "Rather Be" (2 entries, 4 perfs)
**Canonical**: "Rather Be" by Clean Bandit

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-518 | Rather Be | Clean Bandit | 3 |
| song-442 | Rather Be | Clean Bandit(ft.Jess Glynne) | 1 |

### A-0147: "Red" (2 entries, 5 perfs)
**Canonical**: "Red" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1923 | Red | Taylor Swift | 3 |
| song-1642 | Red | Taylor Swift | 2 |

### A-0148: "Reflection" (2 entries, 2 perfs)
**Canonical**: "Reflection" by Christina Aguilera

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1475 | Reflection | Christina Aguilera | 1 |
| song-2053 | Reflection | Christina Aguilera | 1 |

### A-0149: "Reizy" (2 entries, 2 perfs)
**Canonical**: "Reizy" by 澪Rei

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-21 | Reizy | 澪Rei | 1 |
| song-2993 | Reizy | 澪Rei | 1 |

### A-0150: "Remember Me" (2 entries, 2 perfs)
**Canonical**: "Remember Me" by Miguel

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1362 | Remember me | Miguel | 1 |
| song-3090 | Remember Me | Miguel | 1 |

### A-0151: "REVOLVER" (2 entries, 2 perfs)
**Canonical**: "REVOLVER" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-370 | REVOLVER | 奏音69 feat.luz | 1 |
| song-958 | REVOLVER | 奏音69 | 1 |

### A-0152: "Rewrite The Stars" (3 entries, 5 perfs)
**Canonical**: "Rewrite The Stars" by Zac Efron & Zendaya

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2729 | Rewrite The Stars | Zac Efron & Zendaya | 3 |
| song-2456 | Rewrite The Stars | /Zac Efron & Zendaya | 1 |
| song-2971 | rewrite the stars | zac efron & zendaya | 1 |

### A-0153: "Rolling in the Deep" (2 entries, 6 perfs)
**Canonical**: "Rolling in the Deep" by Adele

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-251 | Rolling in the Deep | Adele | 5 |
| song-1679 | Rolling in the Deep | Adele | 1 |

### A-0154: "Safe & Sound" (2 entries, 6 perfs)
**Canonical**: "Safe & Sound" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1178 | Safe & Sound | Taylor Swift | 5 |
| song-2186 | Safe & Sound | Taylor Swift | 1 |

### A-0155: "Santa Tell Me" (2 entries, 4 perfs)
**Canonical**: "Santa Tell Me" by Ariana Grande

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-339 | Santa Tell Me | Ariana Grande | 2 |
| song-1102 | Santa Tell Me | Ariana Grande | 2 |

### A-0156: "Say Something" (5 entries, 8 perfs)
**Canonical**: "Say Something" by A Great Big World, Christina Aguilera

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2275 | Say Something | A Great Big World | 3 |
| song-133 | Say Something | A Great Big World, Christina Aguilera | 2 |
| song-1361 | Say something | A Great Big World, Christina Aguilera | 1 |
| song-2115 | Say Something | A Great Big World, Christina Aguilera | 1 |
| song-1142 | Say Something | A Great Big World,Christina Aguilera | 1 |

### A-0157: "Scarborough Fair" (2 entries, 4 perfs)
**Canonical**: "Scarborough Fair" by Simon & Garfunkel

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1607 | Scarborough Fair | Simon & Garfunkel | 2 |
| song-2301 | Scarborough Fair | Simon & Garfunkel | 2 |

### A-0158: "Set Fire To The Rain" (2 entries, 5 perfs)
**Canonical**: "Set Fire To The Rain" by Adele

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-669 | Set Fire To The Rain | Adele | 4 |
| song-2274 | Set fire to the rain | Adele | 1 |

### A-0159: "Shake It Off" (3 entries, 4 perfs)
**Canonical**: "Shake It Off" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1576 | Shake It Off | Taylor Swift | 2 |
| song-1194 | Shake It Off | Taylor Swift | 1 |
| song-1976 | Shake It Off | Taylor Swift (No Sound) | 1 |

### A-0160: "Shallow" (5 entries, 7 perfs)
**Canonical**: "Shallow" by Lady Gaga & Bradley Cooper

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-94 | Shallow | Lady Gaga & Bradley Cooper | 3 |
| song-52 | SHALLOW | Lady Gaga, Bradley Cooper | 1 |
| song-2629 | Shallow | Lady Gaga & Bradley Cooper (with 515) | 1 |
| song-1930 | shallow | Lady Gaga | 1 |
| song-2027 | Shallow | Lady Gaga (& Bradley Cooper) | 1 |

### A-0161: "Shape of You" (2 entries, 7 perfs)
**Canonical**: "Shape of You" by Ed Sheeran

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-245 | Shape of You | Ed Sheeran | 6 |
| song-2521 | Shape Of You | Ed Sheeran | 1 |

### A-0162: "Side to Side" (2 entries, 2 perfs)
**Canonical**: "Side to Side" by Ariana Grande

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1380 | Side to Side | Ariana Grande | 1 |
| song-2830 | Side to Side | Ariana Grande ft. Nicki Minaj | 1 |

### A-0163: "Sincerely" (3 entries, 6 perfs)
**Canonical**: "Sincerely" by TRUE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-676 | Sincerely | TRUE | 4 |
| song-2031 | Sincerely | TRUE（唐沢美帆） | 1 |
| song-3177 | Sincerely | TRUE | 1 |

### A-0164: "Siɹən" (3 entries, 4 perfs)
**Canonical**: "Siɹən" by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2395 | Siɹən | 浠Mizuki | 2 |
| song-2651 | Siɹən | 浠Mizuki feat.Ring 誓約之聲 | 1 |
| song-2723 | Siɹən | 浠 Mizuki ft. 誓約之聲 Ring | 1 |

### A-0165: "Skinny Love" (2 entries, 4 perfs)
**Canonical**: "Skinny Love" by Birdy

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-444 | Skinny Love | Birdy | 3 |
| song-1481 | Skinny Love | Birdy | 1 |

### A-0166: "Smile For You" (3 entries, 3 perfs)
**Canonical**: "Smile For You" by ユナ(神田沙也加)

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-821 | smile for you | ユナ(神田沙也加) | 1 |
| song-1478 | Smile For You | ユナ(神田沙也加) | 1 |
| song-3010 | Smile For You | ユナ(神田沙也加) | 1 |

### A-0167: "Snow Fairy Story" (2 entries, 2 perfs)
**Canonical**: "Snow Fairy Story" by 40㍍P

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-343 | Snow Fairy Story | 40㍍P | 1 |
| song-1096 | Snow fairy story | 40㍍P | 1 |

### A-0168: "Snow halation" (3 entries, 5 perfs)
**Canonical**: "Snow halation" by μ's

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1098 | Snow halation | μ's | 3 |
| song-342 | Snow Halation | μ's | 1 |
| song-599 | Snow halation | μ's | 1 |

### A-0169: "Snow mile" (2 entries, 2 perfs)
**Canonical**: "Snow mile" by Aqu3ra

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1084 | Snow mile | Aqu3ra | 1 |
| song-1962 | Snow Mile | Aqu3ra | 1 |

### A-0170: "Someone You loved" (3 entries, 8 perfs)
**Canonical**: "Someone You loved" by Lewis Capaldi

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1974 | Someone You loved | Lewis Capaldi | 4 |
| song-153 | Someone You Loved | Lewis Capaldi | 3 |
| song-1299 | Someone you loved | Lewis Capaldi | 1 |

### A-0171: "Something Just Like This" (3 entries, 5 perfs)
**Canonical**: "Something Just Like This" by The Chainsmokers & Coldplay

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-641 | Something Just Like This | The Chainsmokers & Coldplay | 2 |
| song-1355 | Something just like this | The Chainsmokers & Coldplay | 2 |
| song-2114 | Something Just Like This | The Chainsmokers & Coldplay | 1 |

### A-0172: "Somewhere Over The Rainbow" (2 entries, 2 perfs)
**Canonical**: "Somewhere Over The Rainbow" by Harold Arlen

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-836 | Somewhere Over The Rainbow | Harold Arlen | 1 |
| song-1590 | somewhere over the rainbow | Harold Arlen | 1 |

### A-0173: "StarCrew" (2 entries, 2 perfs)
**Canonical**: "StarCrew" by Sou

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1909 | StarCrew | Sou | 1 |
| song-1926 | Starcrew | Sou | 1 |

### A-0174: "starduster" (2 entries, 2 perfs)
**Canonical**: "starduster" by ジミーサムP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1045 | Starduster | ジミーサムP | 1 |
| song-1759 | starduster | ジミーサムP | 1 |

### A-0175: "Stars are here" (2 entries, 8 perfs)
**Canonical**: "Stars are here" by 96猫

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-823 | Stars are here | 96猫 | 7 |
| song-2096 | stars are here | 96猫 | 1 |

### A-0176: "stars we chase" (2 entries, 3 perfs)
**Canonical**: "stars we chase" by ミア・テイラー

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1032 | stars we chase | ミア・テイラー | 2 |
| song-1757 | stars we chase | ミア・テイラー(CV.内田 秀) | 1 |

### A-0177: "START" (2 entries, 2 perfs)
**Canonical**: "START" by レフティーモンスターP-伊東歌詞太郎

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1128 | START | レフティーモンスターP-伊東歌詞太郎 | 1 |
| song-2575 | START | レフティーモンスターP-伊東歌詞太郎 | 1 |

### A-0178: "Starving" (2 entries, 2 perfs)
**Canonical**: "Starving" by Hailee Steinfeld,Grey-ft.Zedd

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-113 | Starving | Hailee Steinfeld,Grey-ft.Zedd | 1 |
| song-1489 | Starving | Hailee Steinfeld & Grey ft. Zedd | 1 |

### A-0179: "STAY" (2 entries, 3 perfs)
**Canonical**: "STAY" by The Kid LAROI & Justin Bieber

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-256 | STAY | The Kid LAROI & Justin Bieber | 2 |
| song-1807 | Stay | The Kid LAROI, Justin Bieber | 1 |

### A-0180: "Stellar Stellar" (2 entries, 9 perfs)
**Canonical**: "Stellar Stellar" by 星街すいせい

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-527 | Stellar Stellar | 星街すいせい | 8 |
| song-1658 | Stellar Stellar | 星街すいせい | 1 |

### A-0181: "Sugar" (2 entries, 5 perfs)
**Canonical**: "Sugar" by Maroon 5

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-439 | Sugar | Maroon 5 | 4 |
| song-1577 | Sugar | Maroon 5 | 1 |

### A-0182: "Summertime" (3 entries, 6 perfs)
**Canonical**: "Summertime" by cinnamons × evening cinema

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1233 | Summertime | cinnamons × evening cinema | 3 |
| song-2346 | summertime | cinnamons × evening cinema | 2 |
| song-1281 | SUMMERTIME | cinnamons×evening cinema | 1 |

### A-0183: "Sunday Morning" (4 entries, 8 perfs)
**Canonical**: "Sunday Morning" by Maroon 5

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2136 | Sunday Morning | Maroon 5 | 4 |
| song-1829 | Sunday morning | Maroon 5 | 2 |
| song-1752 | Sunday Morning | Maroon 5 | 1 |
| song-2973 | sunday morning | Maroon 5 | 1 |

### A-0184: "Surges" (2 entries, 3 perfs)
**Canonical**: "Surges" by Orangestar

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1794 | Surges | Orangestar | 2 |
| song-1519 | Surges | Orangestar feat. 夏背 & ルワン | 1 |

### A-0185: "Sway to My Beat in Cosmos" (2 entries, 3 perfs)
**Canonical**: "Sway to My Beat in Cosmos" by Chevy

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2419 | Sway to My Beat in Cosmos | Chevy | 2 |
| song-2865 | Sway to My Beat In Cosmos | Chevy | 1 |

### A-0186: "Sweet Child O' Mine" (2 entries, 3 perfs)
**Canonical**: "Sweet Child O' Mine" by Guns N' Roses

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1260 | Sweet Child O' Mine | Guns N' Roses | 2 |
| song-1514 | Sweet Child O' Mine | Gun N' Roses | 1 |

### A-0187: "sweets parade" (2 entries, 3 perfs)
**Canonical**: "sweets parade" by 花澤香菜

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1449 | sweets parade | 花澤香菜 | 2 |
| song-675 | Sweets Parade | 花澤香菜 | 1 |

### A-0188: "Symphony" (2 entries, 4 perfs)
**Canonical**: "Symphony" by Clean Bandit

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2061 | Symphony | Clean Bandit | 3 |
| song-2081 | Symphony | Clean Bandit | 1 |

### A-0189: "Take Me Home, Country Roads" (2 entries, 2 perfs)
**Canonical**: "Take Me Home, Country Roads" by John Denver

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1646 | Take Me Home, Country Roads | John Denver | 1 |
| song-1809 | Take Me Home, Country Roads | John Denver | 1 |

### A-0190: "Target for Love" (2 entries, 4 perfs)
**Canonical**: "Target for Love" by Lee Jin Ah

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2216 | Target for Love | Lee Jin Ah | 3 |
| song-1445 | Target for Love | Lee Jin-ah | 1 |

### A-0191: "Tell your world" (3 entries, 5 perfs)
**Canonical**: "Tell your world" by kz

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-108 | Tell your world | kz(livetune) | 2 |
| song-635 | Tell Your World | kz | 2 |
| song-1932 | Tell your world | kz（livetune） | 1 |

### A-0192: "Tequila" (2 entries, 3 perfs)
**Canonical**: "Tequila" by The Champs

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1340 | Tequila | The Champs | 2 |
| song-1578 | Tequila | The Champs | 1 |

### A-0193: "The Golden Age" (2 entries, 4 perfs)
**Canonical**: "The Golden Age" by The Asteroids Galaxy Tour

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-249 | The Golden Age | The Asteroids Galaxy Tour | 3 |
| song-1579 | The Golden Age | The Asteroids Galaxy Tour | 1 |

### A-0194: "The Man Who Can’t Be Moved" (2 entries, 4 perfs)
**Canonical**: "The Man Who Can’t Be Moved" by The Script

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-837 | The Man Who Can’t Be Moved | The Script | 2 |
| song-2047 | The Man Who Can't Be Moved | The Script | 2 |

### A-0195: "The Winner Takes It All" (2 entries, 4 perfs)
**Canonical**: "The Winner Takes It All" by ABBA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-606 | The Winner Takes It All | ABBA | 3 |
| song-154 | The Winner Takes it All | ABBA | 1 |

### A-0196: "Theme of King J.J." (2 entries, 2 perfs)
**Canonical**: "Theme of King J.J." by 梅林太郎 ft. Linus Norda

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-101 | Theme of King J.J. | 梅林太郎 ft. Linus Norda | 1 |
| song-1092 | Theme of King J.J. | 梅林太郎 ft. Linus Norda | 1 |

### A-0197: "Think of You" (2 entries, 4 perfs)
**Canonical**: "Think of You" by オフィーリア(acane_madder)

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1452 | Think of You | オフィーリア(acane_madder) | 3 |
| song-3015 | Think of You | オフィーリア (CV：Acane Madder) | 1 |

### A-0198: "Top of the world" (3 entries, 3 perfs)
**Canonical**: "Top of the world" by Carpenters

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1263 | Top of the world | Carpenters | 1 |
| song-1568 | Top of the World | Carpenters | 1 |
| song-2405 | Top Of The World | Carpenters | 1 |

### A-0199: "True my heart" (2 entries, 2 perfs)
**Canonical**: "True my heart" by ave;new-佐倉紗織

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1028 | True my heart | ave;new-佐倉紗織 | 1 |
| song-1622 | True my heart | ave;new-佐倉紗織 | 1 |

### A-0200: "U" (4 entries, 5 perfs)
**Canonical**: "U" by millennium parade-Belle

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-262 | U | millennium parade-Belle | 2 |
| song-266 | U | Millennium Parade | 1 |
| song-605 | U | millennium parade | 1 |
| song-1242 | U | millennium parade-Belle-中村佳穂 | 1 |

### A-0201: "umbrella" (3 entries, 4 perfs)
**Canonical**: "umbrella" by Mrs. GREEN APPLE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2243 | umbrella | Mrs. GREEN APPLE | 2 |
| song-2497 | Umbrella | Mrs. Green Apple | 1 |
| song-2881 | umbrella | Mrs.GREENAPPLE | 1 |

### A-0202: "Under the sea" (2 entries, 3 perfs)
**Canonical**: "Under the sea" by The Little Mermaid

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-448 | Under the sea | The Little Mermaid | 2 |
| song-747 | Under The Sea | The Little Mermaid | 1 |

### A-0203: "Unholy" (2 entries, 2 perfs)
**Canonical**: "Unholy" by Sam Smith & Kim Petras

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2349 | Unholy | Sam Smith & Kim Petras 開始 | 1 |
| song-2516 | Unholy | Sam Smith & Kim Petras | 1 |

### A-0204: "unlasting" (2 entries, 4 perfs)
**Canonical**: "unlasting" by LiSA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-177 | unlasting | LiSA | 3 |
| song-1970 | unlasting | LISA (ソードアート・オンライン アリシゼーション) | 1 |

### A-0205: "unravel" (3 entries, 5 perfs)
**Canonical**: "unravel" by TK from 凛として時雨

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-167 | unravel | TK from 凛として時雨 | 3 |
| song-1059 | Unravel | TK from 凛として時雨 | 1 |
| song-1935 | unravel | TK | 1 |

### A-0206: "Versace on the Floor" (2 entries, 4 perfs)
**Canonical**: "Versace on the Floor" by Bruno Mars

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1275 | Versace on the Floor | Bruno Mars | 3 |
| song-1973 | Versace On The Floor | Bruno Mars | 1 |

### A-0207: "Wake Me Up When September Ends" (2 entries, 3 perfs)
**Canonical**: "Wake Me Up When September Ends" by Green Day

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1264 | Wake Me Up When September Ends | Green Day | 2 |
| song-3074 | Wake Me Up When September Ends | Green Day | 1 |

### A-0208: "Wake Up Your Hero" (2 entries, 2 perfs)
**Canonical**: "Wake Up Your Hero" by P5X《女神異聞錄：夜幕魅影》

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2075 | Wake Up Your Hero | P5X《女神異聞錄：夜幕魅影》 | 1 |
| song-2443 | Wake up your hero | P5X《女神異聞錄：夜幕魅影》 | 1 |

### A-0209: "Wasted Nights" (2 entries, 3 perfs)
**Canonical**: "Wasted Nights" by ONE OK ROCK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-554 | Wasted Nights | ONE OK ROCK | 2 |
| song-2345 | Wasted nights | ONE OK ROCK | 1 |

### A-0210: "Way Back Into Love" (2 entries, 4 perfs)
**Canonical**: "Way Back Into Love" by Hugh Grant & Haley Bennett

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1016 | Way Back Into Love | Hugh Grant & Haley Bennett | 3 |
| song-1949 | Way Back Into Love | Hugh Grant and Haley Bennett | 1 |

### A-0211: "We are" (2 entries, 4 perfs)
**Canonical**: "We are" by ONE OK ROCK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-23 | We are | ONE OK ROCK | 3 |
| song-1210 | We Are | ONE OK ROCK | 1 |

### A-0212: "We Are Never Ever Getting Back Together" (2 entries, 2 perfs)
**Canonical**: "We Are Never Ever Getting Back Together" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1975 | We Are Never Ever Getting Back Together | Taylor Swift | 1 |
| song-2171 | We Are Never Ever Getting Back Together | Taylor Swift | 1 |

### A-0213: "We can't be friends" (3 entries, 3 perfs)
**Canonical**: "We can't be friends" by Ariana Grande

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2425 | We can't be friends | Ariana Grande | 1 |
| song-2485 | we can't be friends | Ariana Grande | 1 |
| song-2609 | we can’t be friends | Ariana Grande | 1 |

### A-0214: "We Don't Talk Anymore" (2 entries, 3 perfs)
**Canonical**: "We Don't Talk Anymore" by Charlie Puth

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2234 | We Don't Talk Anymore | Charlie Puth | 2 |
| song-2904 | We Don't Talk Anymore | Charlie Puth & Selena Gomez | 1 |

### A-0215: "What is love???" (2 entries, 3 perfs)
**Canonical**: "What is love???" by JU!iE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-243 | What is love??? | JU!iE | 2 |
| song-2852 | What is love??? | JU!IE | 1 |

### A-0216: "When Christmas Comes to Town" (2 entries, 2 perfs)
**Canonical**: "When Christmas Comes to Town" by Matthew Hall & Meagan Moore

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2604 | When Christmas Comes to Town | Matthew Hall & Meagan Moore | 1 |
| song-3154 | When Christmas Comes To Town | Matthew Hall & Meagan Moore | 1 |

### A-0217: "Wherever you are" (3 entries, 3 perfs)
**Canonical**: "Wherever you are" by ONE OK ROCK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1186 | Wherever you are | ONE OK ROCK | 1 |
| song-1464 | Wherever you are | ONE OK ROCK | 1 |
| song-1955 | Wherever You Are | ONE OK ROCK | 1 |

### A-0218: "White Christmas" (2 entries, 2 perfs)
**Canonical**: "White Christmas" by Michael Bublé

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1081 | White Christmas | Michael Bublé | 1 |
| song-2579 | White Christmas | Michael Bublé | 1 |

### A-0219: "Wildest Dreams" (2 entries, 2 perfs)
**Canonical**: "Wildest Dreams" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2085 | Wildest Dreams | Taylor Swift | 1 |
| song-2494 | Wildest Dreams | Taylor Swift | 1 |

### A-0220: "Wonderwall" (2 entries, 3 perfs)
**Canonical**: "Wonderwall" by Oasis

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1352 | Wonderwall | Oasis | 2 |
| song-645 | WonderWall | Oasis | 1 |

### A-0221: "You Belong With Me" (2 entries, 2 perfs)
**Canonical**: "You Belong With Me" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1150 | You Belong With Me | Taylor Swift | 1 |
| song-2175 | You Belong With Me | Taylor Swift | 1 |

### A-0222: "You Only Live Once" (2 entries, 2 perfs)
**Canonical**: "You Only Live Once" by 西寺郷太-羽多野涉-彦田元気

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-594 | You Only Live Once | 西寺郷太-羽多野涉-彦田元気 | 1 |
| song-1093 | You only live once | 西寺郷太-羽多野涉-彦田元気 | 1 |

### A-0223: "Zoo" (2 entries, 2 perfs)
**Canonical**: "Zoo" by Shakira

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-352 | Zoo | Shakira | 1 |
| song-3162 | Zoo | Shakira (浠Mizuki) | 1 |

### A-0224: "あたしを彼女にしたいなら" (2 entries, 2 perfs)
**Canonical**: "あたしを彼女にしたいなら" by コレサワ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1750 | あたしを彼女にしたいなら | コレサワ | 1 |
| song-2304 | あたしを彼女にしたいなら | コレサワ | 1 |

### A-0225: "いのちの名前" (2 entries, 3 perfs)
**Canonical**: "いのちの名前" by 木村弓

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2071 | いのちの名前 | 木村弓 | 2 |
| song-831 | いのちの名前 | 木村弓-久石讓-覚和歌子 | 1 |

### A-0226: "いーあるふぁんくらぶ" (3 entries, 6 perfs)
**Canonical**: "いーあるふぁんくらぶ" by みきとP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-975 | いーあるふぁんくらぶ | みきとP | 4 |
| song-800 | いーあるふぁんくらぶ | みきとP | 1 |
| song-2639 | いーあるふぁんくらぶ | みきとP (with 心咲KOE) | 1 |

### A-0227: "うっせぇわ" (2 entries, 5 perfs)
**Canonical**: "うっせぇわ" by Ado

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-35 | うっせぇわ | Ado | 4 |
| song-1984 | うっせぇわ | ADO | 1 |

### A-0228: "うらたねこ♀" (2 entries, 3 perfs)
**Canonical**: "うらたねこ♀" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-869 | うらたねこ♀ | HoneyWorks | 2 |
| song-1446 | うらたねこ♀ | HoneyWorks,Kaoru feat. 可不 | 1 |

### A-0229: "おおかみは赤ずきんに恋をした" (2 entries, 2 perfs)
**Canonical**: "おおかみは赤ずきんに恋をした" by ひとしずくP・やま△

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1457 | おおかみは赤ずきんに恋をした | ひとしずくP・やま△ | 1 |
| song-2941 | おおかみは赤ずきんに恋をした | ひとしずくP・やま△ | 1 |

### A-0230: "おちゃめ機能" (3 entries, 3 perfs)
**Canonical**: "おちゃめ機能" by ゴジマジP ft. 重音テト

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1109 | おちゃめ機能 | ゴジマジP | 1 |
| song-1625 | おちゃめ機能 | ゴジマジP ft. 重音テト | 1 |
| song-2771 | おちゃめ機能 | ゴジマジP ft. 重音テト | 1 |

### A-0231: "おなじ話" (3 entries, 4 perfs)
**Canonical**: "おなじ話" by ハンバート ハンバート

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-986 | おなじ話 | ハンバート ハンバート | 2 |
| song-2188 | おなじ話 | ハンバート ハンバート | 1 |
| song-2946 | おなじ話 | ハンバートハンバート | 1 |

### A-0232: "おもかげ" (2 entries, 3 perfs)
**Canonical**: "おもかげ" by milet & Aimer & 幾田りら

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2420 | おもかげ | milet & Aimer & 幾田りら | 2 |
| song-2868 | おもかげ | milet × Aimer × 幾田りら | 1 |

### A-0233: "からくりピエロ" (2 entries, 6 perfs)
**Canonical**: "からくりピエロ" by 40㍍P

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-221 | からくりピエロ | 40㍍P | 5 |
| song-1461 | からくりピエロ | 40㍍P | 1 |

### A-0234: "さよならだけが人生だ" (2 entries, 2 perfs)
**Canonical**: "さよならだけが人生だ" by 伊東歌詞太郎

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1857 | さよならだけが人生だ | 伊東歌詞太郎 feat. 初音ミク | 1 |
| song-2342 | さよならだけが人生だ | 伊東歌詞太郎 | 1 |

### A-0235: "さよならの夏～コクリコ坂から～" (2 entries, 3 perfs)
**Canonical**: "さよならの夏～コクリコ坂から～" by 手嶌葵

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-673 | さよならの夏～コクリコ坂から～ | 手嶌葵 | 2 |
| song-1602 | さよならの夏～コクリコ坂から～ | 手嶌葵 | 1 |

### A-0236: "すずめ" (4 entries, 7 perfs)
**Canonical**: "すずめ" by RADWIMPS ft.十明

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1663 | すずめ | RADWIMPS ft.十明 | 2 |
| song-1852 | すずめ | RADWIMPS | 2 |
| song-2459 | すずめ | RADWIMPS feat.十明 | 2 |
| song-1488 | すずめ | RADWIMPS ft.十明 | 1 |

### A-0237: "ただ君に晴れ" (2 entries, 5 perfs)
**Canonical**: "ただ君に晴れ" by ヨルシカ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-19 | ただ君に晴れ | ヨルシカ | 4 |
| song-1770 | ただ君に晴れ | ヨルシカ | 1 |

### A-0238: "ねこみみスイッチ" (2 entries, 2 perfs)
**Canonical**: "ねこみみスイッチ" by daniwell

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-618 | ねこみみスイッチ | daniwellP | 1 |
| song-2294 | ねこみみスイッチ | daniwell | 1 |

### A-0239: "ねむるまち" (4 entries, 6 perfs)
**Canonical**: "ねむるまち" by くじら,yama

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1584 | ねむるまち | くじら | 3 |
| song-524 | ねむるまち | くじら,yama | 1 |
| song-2119 | ねむるまち | くじら,yama | 1 |
| song-1012 | ねむるまち | くじら-yama | 1 |

### A-0240: "はなればなれの君へ" (3 entries, 6 perfs)
**Canonical**: "はなればなれの君へ" by Belle

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-426 | はなればなれの君へ | Belle | 2 |
| song-2460 | はなればなれの君へ | belle | 2 |
| song-898 | はなればなれの君へ | Belle-中村佳穂 | 2 |

### A-0241: "ふたりごと" (2 entries, 5 perfs)
**Canonical**: "ふたりごと" by TRUE & 茅原実里

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2490 | ふたりごと | TRUE & 茅原実里 | 4 |
| song-2751 | ふたりごと | TRUE & 茅原実里 ft.浠 Mizuki | 1 |

### A-0242: "ふわふわ時間" (2 entries, 4 perfs)
**Canonical**: "ふわふわ時間" by 放課後ティータイム

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-166 | ふわふわ時間 | 放課後ティータイム | 3 |
| song-1623 | ふわふわ時間 | 放課後ティータイム | 1 |

### A-0243: "ほしのこもりうた" (2 entries, 3 perfs)
**Canonical**: "ほしのこもりうた" by 天月-あまつき-

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2464 | ほしのこもりうた | 天月-あまつき- | 2 |
| song-1806 | ほしのこもりうた | 天月 | 1 |

### A-0244: "ようこそジャパリパークへ" (2 entries, 2 perfs)
**Canonical**: "ようこそジャパリパークへ" by 大石昌良

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-865 | ようこそジャパリパークへ | 大石昌良 | 1 |
| song-1453 | ようこそジャパリパークへ | 大石昌良 | 1 |

### A-0245: "アイのシナリオ" (2 entries, 4 perfs)
**Canonical**: "アイのシナリオ" by CHiCO with HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-697 | アイのシナリオ | CHiCO with HoneyWorks | 3 |
| song-2739 | アイのシナリオ | CHiCO with HoneyWoks | 1 |

### A-0246: "アイドル" (2 entries, 12 perfs)
**Canonical**: "アイドル" by YOASOBI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-212 | アイドル | YOASOBI | 9 |
| song-1627 | アイドル | YOASOBI | 3 |

### A-0247: "アヤノの幸福理論" (4 entries, 4 perfs)
**Canonical**: "アヤノの幸福理論" by じん

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-628 | アヤノの幸福理論 | じん(自然の敵P) | 1 |
| song-2224 | アヤノの幸福理論 | じん (IA) | 1 |
| song-2468 | アヤノの幸福理論 | じん | 1 |
| song-2620 | アヤノの幸福理論 | じん (with 萊菈．希格娜斯) | 1 |

### A-0248: "アンコール" (2 entries, 7 perfs)
**Canonical**: "アンコール" by YOASOBI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-222 | アンコール | YOASOBI | 6 |
| song-1592 | アンコール | YOASOBI | 1 |

### A-0249: "ウィアートル" (2 entries, 4 perfs)
**Canonical**: "ウィアートル" by rionos

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-425 | ウィアートル | rionos | 3 |
| song-1477 | ウィアートル | rionos | 1 |

### A-0250: "ウミユリ海底譚" (2 entries, 2 perfs)
**Canonical**: "ウミユリ海底譚" by n-buna

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-188 | ウミユリ海底譚 | n-buna | 1 |
| song-1297 | ウミユリ海底譚 | n-buna | 1 |

### A-0251: "エンヴィーベイビー" (2 entries, 4 perfs)
**Canonical**: "エンヴィーベイビー" by Kanaria

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-44 | エンヴィーベイビー | Kanaria feat. GUMI | 2 |
| song-602 | エンヴィーベイビー | Kanaria | 2 |

### A-0252: "カタオモイ" (3 entries, 15 perfs)
**Canonical**: "カタオモイ" by Aimer

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-985 | カタオモイ | Aimer | 8 |
| song-210 | カタオモイ | Aimer | 6 |
| song-1666 | カタオモイ | Aimer | 1 |

### A-0253: "キスだけで" (3 entries, 5 perfs)
**Canonical**: "キスだけで" by 菅田将暉

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1921 | キスだけで | 菅田将暉 | 2 |
| song-2154 | キスだけで | 菅田将暉 feat. あいみょん | 2 |
| song-2140 | キスだけで | 菅田将暉feat. あいみょん | 1 |

### A-0254: "キャットアイメイク" (2 entries, 3 perfs)
**Canonical**: "キャットアイメイク" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-955 | キャットアイメイク | 奏音69 | 2 |
| song-368 | キャットアイメイク | 奏音69 feat.巡音ルカ | 1 |

### A-0255: "ギラギラ" (3 entries, 8 perfs)
**Canonical**: "ギラギラ" by Ado

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-90 | ギラギラ | Ado | 6 |
| song-1983 | ギラギラ | ADO | 1 |
| song-2630 | ギラギラ | Ado (with Ellise) | 1 |

### A-0256: "クイーンオブハート" (3 entries, 6 perfs)
**Canonical**: "クイーンオブハート" by 奏音69 feat.luz

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-678 | クイーンオブハート | 奏音69 | 4 |
| song-380 | クイーンオブハート | 奏音69 feat.luz | 1 |
| song-1766 | クイーンオブハート | 奏音69 feat.luz | 1 |

### A-0257: "クリスマスソング" (2 entries, 4 perfs)
**Canonical**: "クリスマスソング" by back number

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1099 | クリスマスソング | back number | 3 |
| song-593 | クリスマスソング | back number | 1 |

### A-0258: "クリームソーダとシャンデリア" (2 entries, 2 perfs)
**Canonical**: "クリームソーダとシャンデリア" by Henri-mei

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-926 | クリームソーダとシャンデリア | Henri-mei | 1 |
| song-2099 | クリームソーダとシャンデリア | Henrii - Mei | 1 |

### A-0259: "ゴーストルール" (2 entries, 3 perfs)
**Canonical**: "ゴーストルール" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1010 | ゴーストルール | DECO*27 | 2 |
| song-468 | ゴーストルール | DECO*27 | 1 |

### A-0260: "サマータイムレコード" (2 entries, 2 perfs)
**Canonical**: "サマータイムレコード" by じん

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-902 | サマータイムレコード | じん（自然の敵P） | 1 |
| song-2329 | サマータイムレコード | じん | 1 |

### A-0261: "サムライハート" (2 entries, 3 perfs)
**Canonical**: "サムライハート" by SPYAIR

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-701 | サムライハート | SPYAIR | 2 |
| song-2642 | サムライハート | SPYAIR (with 久田はくぜん) | 1 |

### A-0262: "サンドリヨン" (3 entries, 4 perfs)
**Canonical**: "サンドリヨン" by シグナルP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2045 | サンドリヨン | シグナルP | 2 |
| song-980 | サンドリヨン | シグナルP | 1 |
| song-3156 | サンドリヨン | シグナルP (浠Mizuki＆澪Rei) | 1 |

### A-0263: "シャルル" (2 entries, 2 perfs)
**Canonical**: "シャルル" by flower

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-269 | シャルル | flower | 1 |
| song-2356 | シャルル | v flower | 1 |

### A-0264: "スイートマジック" (2 entries, 3 perfs)
**Canonical**: "スイートマジック" by Junky

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1006 | スイートマジック | Junky | 2 |
| song-135 | スイートマジック | Junky | 1 |

### A-0265: "ダーリン" (2 entries, 3 perfs)
**Canonical**: "ダーリン" by Mrs. GREEN APPLE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-363 | ダーリン | Mrs. GREEN APPLE | 2 |
| song-1742 | ダーリン | Mrs. GREEN APPLE | 1 |

### A-0266: "チェリーハント" (2 entries, 6 perfs)
**Canonical**: "チェリーハント" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-971 | チェリーハント | 奏音69 | 4 |
| song-369 | チェリーハント | 奏音69 feat.luz | 2 |

### A-0267: "チェルシー" (2 entries, 2 perfs)
**Canonical**: "チェルシー" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-376 | チェルシー | 奏音69 feat.luz | 1 |
| song-969 | チェルシー | 奏音69 | 1 |

### A-0268: "チューリングラブ" (3 entries, 3 perfs)
**Canonical**: "チューリングラブ" by ナナヲアカリ & Sou

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1956 | チューリングラブ | ナナヲアカリ & Sou | 1 |
| song-2735 | チューリングラブ | ナナヲアカリ ft. Sou | 1 |
| song-2908 | チューリングラブ | ナナヲアカリ feat.Sou | 1 |

### A-0269: "デーモンロード" (2 entries, 3 perfs)
**Canonical**: "デーモンロード" by Kanaria

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2436 | デーモンロード | Kanaria | 2 |
| song-312 | デーモンロード | kanaria | 1 |

### A-0270: "ド屑" (2 entries, 3 perfs)
**Canonical**: "ド屑" by なきそ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2004 | ド屑 | なきそ | 2 |
| song-1515 | ド屑 | なきそ feat.歌愛ユキ | 1 |

### A-0271: "ネクロの花嫁" (2 entries, 5 perfs)
**Canonical**: "ネクロの花嫁" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-968 | ネクロの花嫁 | 奏音69 | 4 |
| song-372 | ネクロの花嫁 | 奏音69 feat.びす | 1 |

### A-0272: "ハッピーシンセサイザ" (2 entries, 2 perfs)
**Canonical**: "ハッピーシンセサイザ" by EasyPop

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1122 | ハッピーシンセサイザ | EasyPop | 1 |
| song-2001 | ハッピーシンセサイザ | Easy Pop | 1 |

### A-0273: "ハム太郎とっとこうた" (3 entries, 7 perfs)
**Canonical**: "ハム太郎とっとこうた" by 河井リツ子

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-793 | ハム太郎とっとこうた | 河井リツ子 | 3 |
| song-1469 | ハム太郎とっとこうた | 河井リツ子 | 3 |
| song-2661 | ハム太郎とっとこうた | 河井リツ子 (with 浠Mizuki) | 1 |

### A-0274: "ハロ/ハワユ" (2 entries, 6 perfs)
**Canonical**: "ハロ/ハワユ" by ナノウ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-223 | ハロ/ハワユ | ナノウ | 5 |
| song-495 | ハロ／ハワユ | ナノウ | 1 |

### A-0275: "ビタースウィート" (2 entries, 3 perfs)
**Canonical**: "ビタースウィート" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-966 | ビタースウィート | 奏音69 | 2 |
| song-374 | ビタースウィート | 奏音69 feat.luz | 1 |

### A-0276: "ビーストインザビューティ" (2 entries, 3 perfs)
**Canonical**: "ビーストインザビューティ" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-960 | ビーストインザビューティ | 奏音69 | 2 |
| song-371 | ビーストインザビューティ | 奏音69 feat.luz | 1 |

### A-0277: "ファンサ" (2 entries, 6 perfs)
**Canonical**: "ファンサ" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-746 | ファンサ | HoneyWorks | 5 |
| song-408 | ファンサ | HoneyWorks feat.mona（CV：夏川椎菜） | 1 |

### A-0278: "ファントムペイン" (2 entries, 2 perfs)
**Canonical**: "ファントムペイン" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-375 | ファントムペイン | 奏音69 feat.luz | 1 |
| song-959 | ファントムペイン | 奏音69 | 1 |

### A-0279: "フォニイ" (2 entries, 8 perfs)
**Canonical**: "フォニイ" by ツミキ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-610 | フォニイ | ツミキ | 7 |
| song-2619 | フォニイ | ツミキ (with 帕洛特) | 1 |

### A-0280: "フォニイ" (2 entries, 2 perfs)
**Canonical**: "フォニイ" by phony

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1103 | フォニイ | phony | 1 |
| song-1649 | フォニイ | phony - kafu | 1 |

### A-0281: "フクロウ～フクロウが知らせる客が来たと～" (2 entries, 3 perfs)
**Canonical**: "フクロウ～フクロウが知らせる客が来たと～" by KOKIA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-120 | フクロウ～フクロウが知らせる客が来たと～ | KOKIA | 2 |
| song-1606 | フクロウ～フクロウが知らせる客が来たと～ | KOKIA | 1 |

### A-0282: "フラジール" (2 entries, 3 perfs)
**Canonical**: "フラジール" by ぬゆり

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-977 | フラジール | ぬゆり | 2 |
| song-887 | フラジール | ぬゆり (with 弦戶帝丹) | 1 |

### A-0283: "フラレガイガール" (2 entries, 2 perfs)
**Canonical**: "フラレガイガール" by 酸欠少女さユり

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2574 | フラレガイガール | 酸欠少女さユり | 1 |
| song-2874 | フラレガイガール | 酸欠少女 さユり | 1 |

### A-0284: "プライド革命" (2 entries, 2 perfs)
**Canonical**: "プライド革命" by CHiCO with HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1789 | プライド革命 | CHiCO with HoneyWorks | 1 |
| song-2135 | プライド革命 | CHiCO with HoneyWorks | 1 |

### A-0285: "プラネタリウム" (2 entries, 2 perfs)
**Canonical**: "プラネタリウム" by 大塚愛

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2348 | プラネタリウム | 大塚愛 | 1 |
| song-2357 | プラネタリウム | 大塚 愛 | 1 |

### A-0286: "ベノム" (4 entries, 6 perfs)
**Canonical**: "ベノム" by かいりきベア

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1052 | ベノム | かいりきベア | 3 |
| song-398 | ベノム | かいりきベア feat.flower | 1 |
| song-2773 | ベノム | かいりきベア ft. flower | 1 |
| song-2737 | ベノム | かいりきベア  ft.flower | 1 |

### A-0287: "マジックリングナイト" (2 entries, 4 perfs)
**Canonical**: "マジックリングナイト" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-967 | マジックリングナイト | 奏音69 | 3 |
| song-379 | マジックリングナイト | 奏音69 feat.luz | 1 |

### A-0288: "マトリョシカ" (2 entries, 2 perfs)
**Canonical**: "マトリョシカ" by ハチ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2341 | マトリョシカ | ハチ | 1 |
| song-2611 | マトリョシカ | ハチ (with 韶花) | 1 |

### A-0289: "マフィア" (2 entries, 3 perfs)
**Canonical**: "マフィア" by wotaku

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1170 | マフィア | wotaku | 2 |
| song-152 | マフィア | wotaku feat. 初音ミク | 1 |

### A-0290: "ミスター・ダーリン" (3 entries, 4 perfs)
**Canonical**: "ミスター・ダーリン" by CHiCO with HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2866 | ミスター・ダーリン | CHiCO with HoneyWorks | 2 |
| song-853 | ミスター･ダーリン | CHiCO with HoneyWorks | 1 |
| song-1617 | ミスター・ダーリン | CHiCO with HoneyWorks | 1 |

### A-0291: "ミリオンダラードリーマー" (2 entries, 4 perfs)
**Canonical**: "ミリオンダラードリーマー" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-730 | ミリオンダラードリーマー | 奏音69 | 3 |
| song-367 | ミリオンダラードリーマー | 奏音69 feat.巡音ルカ | 1 |

### A-0292: "ミルクとコーヒー" (2 entries, 2 perfs)
**Canonical**: "ミルクとコーヒー" by 伊東歌詞太郎

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1027 | ミルクとコーヒー | 伊東歌詞太郎-れるりり | 1 |
| song-3016 | ミルクとコーヒー | 伊東歌詞太郎 | 1 |

### A-0293: "メルト" (2 entries, 2 perfs)
**Canonical**: "メルト" by supercell

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1630 | メルト | supercell | 1 |
| song-2962 | メルト | supercell | 1 |

### A-0294: "ラブカ?" (3 entries, 6 perfs)
**Canonical**: "ラブカ?" by 柊キライ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-310 | ラブカ? | 柊キライ | 4 |
| song-46 | ラブカ? | 柊キライ feat. v flower | 1 |
| song-1706 | ラブカ？ | 柊キライ | 1 |

### A-0295: "ラヴィ" (2 entries, 2 perfs)
**Canonical**: "ラヴィ" by すりぃ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-16 | ラヴィ | すりぃ feat.鏡音レン | 1 |
| song-2280 | ラヴィ | すりぃ | 1 |

### A-0296: "レイメイ" (3 entries, 3 perfs)
**Canonical**: "レイメイ" by さユりxMY FIRST STORY

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-423 | レイメイ | さユりxMY FIRST STORY | 1 |
| song-2621 | レイメイ | 酸欠少女さユり & MY FIRST STORY (with 諾特) | 1 |
| song-2909 | レイメイ | さユり & MY FIRST STORY | 1 |

### A-0297: "レオ" (2 entries, 5 perfs)
**Canonical**: "レオ" by 優里

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1459 | レオ | 優里 | 3 |
| song-1998 | レオ | 優里 | 2 |

### A-0298: "ロイヤルフラッシュ" (2 entries, 4 perfs)
**Canonical**: "ロイヤルフラッシュ" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-952 | ロイヤルフラッシュ | 奏音69 | 3 |
| song-366 | ロイヤルフラッシュ | 奏音69 feat.luz | 1 |

### A-0299: "ロキ" (3 entries, 8 perfs)
**Canonical**: "ロキ" by みきとP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-579 | ロキ | みきとP | 6 |
| song-891 | ロキ | みきとP (with 嗚夫沃夫) | 1 |
| song-1455 | ロキ | みきとP | 1 |

### A-0300: "ロストワンの号哭" (2 entries, 4 perfs)
**Canonical**: "ロストワンの号哭" by Neru

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1108 | ロストワンの号哭 | Neru | 3 |
| song-1516 | ロストワンの号哭 | Neru feat.鏡音リン | 1 |

### A-0301: "ロンリーユニバース-Lonely Universe" (2 entries, 2 perfs)
**Canonical**: "ロンリーユニバース-Lonely Universe" by Aqu3ra

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-528 | ロンリーユニバース-Lonely Universe | Aqu3ra feat.初音ミク,flower | 1 |
| song-916 | ロンリーユニバース-Lonely Universe | Aqu3ra | 1 |

### A-0302: "ワールドイズマイン" (3 entries, 3 perfs)
**Canonical**: "ワールドイズマイン" by ryo

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-97 | ワールドイズマイン | ryo (かぐや&月見ヤチヨ ver.) [CPK! Remix] | 1 |
| song-1146 | ワールドイズマイン | ryo | 1 |
| song-1624 | ワールドイズマイン | ryo | 1 |

### A-0303: "ヴァンパイア" (3 entries, 6 perfs)
**Canonical**: "ヴァンパイア" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1005 | ヴァンパイア | DECO*27 | 3 |
| song-463 | ヴァンパイア | DECO*27 | 2 |
| song-1769 | ヴァンパイア | DECO*27 | 1 |

### A-0304: "ヴィラン" (2 entries, 5 perfs)
**Canonical**: "ヴィラン" by てにをは

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1053 | ヴィラン | てにをは | 4 |
| song-883 | ヴィラン | てにをは (with 須多夜花) | 1 |

### A-0305: "一番の宝物" (3 entries, 6 perfs)
**Canonical**: "一番の宝物" by LiSA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-833 | 一番の宝物 | LiSA | 4 |
| song-894 | 一番の宝物 | LiSA (with 帝斗) | 1 |
| song-3181 | 一番の宝物 | LiSA | 1 |

### A-0306: "一眼瞬間" (3 entries, 3 perfs)
**Canonical**: "一眼瞬間" by 張惠妹 & 蕭敬騰

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2372 | 一眼瞬間 | 張惠妹& 蕭敬騰 | 1 |
| song-2386 | 一眼瞬間 | 張惠妹 & 蕭敬騰 | 1 |
| song-2913 | 一眼瞬間 | 張惠妹 & 蕭敬騰 | 1 |

### A-0307: "七彩的微風" (2 entries, 2 perfs)
**Canonical**: "七彩的微風" by 真珠美人魚

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2756 | 七彩的微風 | 真珠美人魚 | 1 |
| song-3009 | 七彩的微風 | 珍珠美人魚 | 1 |

### A-0308: "上弦の月" (2 entries, 2 perfs)
**Canonical**: "上弦の月" by 黒うさP feat. KAITO

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-151 | 上弦の月 | 黒うさP feat. KAITO | 1 |
| song-1065 | 上弦の月 | 黒うさP feat. KAITO | 1 |

### A-0309: "下一站,與你" (3 entries, 3 perfs)
**Canonical**: "下一站,與你" by KSP-3R2-茶米

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-390 | 下一站，與你 | KSP, 3R2, 茶米 | 1 |
| song-784 | 下一站,與你 | KSP-3R2-茶米 | 1 |
| song-1307 | 下一站,與你 | KSP,3R2,茶米 | 1 |

### A-0310: "不是因為天氣晴朗才愛你" (2 entries, 6 perfs)
**Canonical**: "不是因為天氣晴朗才愛你" by 理想混蛋

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2323 | 不是因為天氣晴朗才愛你 | 理想混蛋 | 4 |
| song-2391 | 不是因為天氣晴朗才愛你 | 理想混蛋 | 2 |

### A-0311: "不該" (3 entries, 4 perfs)
**Canonical**: "不該" by 周杰倫

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1786 | 不該 | 周杰倫 | 2 |
| song-2669 | 不該 | 周杰倫 | 1 |
| song-2947 | 不該 | 周杰倫 & 張惠妹 | 1 |

### A-0312: "不識月" (4 entries, 4 perfs)
**Canonical**: "不識月" by LunaSafari

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-912 | 不識月 | Luna_Safari | 1 |
| song-1875 | 不識月 | Luna Safari feat.赤羽 | 1 |
| song-2157 | 不識月 | LunaSafari | 1 |
| song-2438 | 不識月 | Luna Safari | 1 |

### A-0313: "二息步行" (2 entries, 2 perfs)
**Canonical**: "二息步行" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2195 | 二息步行 | DECO*27 | 1 |
| song-2766 | 二息步行 | DECO*27 ft. 初音ミク | 1 |

### A-0314: "人生に拍手喝采を" (2 entries, 7 perfs)
**Canonical**: "人生に拍手喝采を" by 40㍍P

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-346 | 人生に拍手喝采を | 40㍍P | 6 |
| song-1767 | 人生に拍手喝采を | 40㍍P | 1 |

### A-0315: "人生は最高の暇つぶし" (2 entries, 3 perfs)
**Canonical**: "人生は最高の暇つぶし" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-239 | 人生は最高の暇つぶし | HoneyWorks | 2 |
| song-56 | 人生は最高の暇つぶし | HoneyWorks feat. Hanon | 1 |

### A-0316: "他們說我是沒有用的年輕人" (2 entries, 3 perfs)
**Canonical**: "他們說我是沒有用的年輕人" by 好樂團

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1995 | 他們說我是沒有用的年輕人 | 好樂團 | 2 |
| song-1206 | 他們說我是沒有用的年輕人 | 好樂團 GoodBand | 1 |

### A-0317: "你啊你啊" (2 entries, 9 perfs)
**Canonical**: "你啊你啊" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-567 | 你啊你啊 | 魏如萱 | 8 |
| song-2970 | 你啊你啊 | 魏如萱 | 1 |

### A-0318: "你朝我的方向走來" (2 entries, 5 perfs)
**Canonical**: "你朝我的方向走來" by 馬念先 & 9m88

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2367 | 你朝我的方向走來 | 馬念先 & 9m88 | 3 |
| song-1823 | 你朝我的方向走來 | 馬念先 & 9m88 | 2 |

### A-0319: "你的行李" (5 entries, 9 perfs)
**Canonical**: "你的行李" by 謝震廷

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1844 | 你的行李 | 謝震廷 | 3 |
| song-1686 | 你的行李 | 謝震廷 Eli Hsieh, feat. 徐靖玟 | 2 |
| song-1895 | 你的行李 | 謝震廷 | 2 |
| song-522 | 你的行李 | 謝震廷 Eli Hsieh | 1 |
| song-2921 | 你的行李 | 謝震廷 feat.徐靖玟 | 1 |

### A-0320: "你給我聽好" (2 entries, 2 perfs)
**Canonical**: "你給我聽好" by 陳奕迅

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1023 | 你給我聽好 | 陳奕迅 | 1 |
| song-2083 | 你給我聽好 | 陳奕迅 | 1 |

### A-0321: "你被寫在我的歌裡" (2 entries, 3 perfs)
**Canonical**: "你被寫在我的歌裡" by 蘇打綠

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2189 | 你被寫在我的歌裡 | 蘇打綠 | 2 |
| song-2938 | 你被寫在我的歌裡 | 蘇打綠 feat.陳嘉樺 | 1 |

### A-0322: "你那邊幾點" (4 entries, 13 perfs)
**Canonical**: "你那邊幾點" by 孫盛希

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1534 | 你那邊幾點 | 孫盛希 | 8 |
| song-1372 | 你那邊幾點 | 孫盛希Shi Shi | 2 |
| song-1482 | 你那邊幾點 | 孫盛希 | 2 |
| song-1971 | 你那邊幾點 | 孫盛希 Shi Shi | 1 |

### A-0323: "僥倖ダンス" (2 entries, 2 perfs)
**Canonical**: "僥倖ダンス" by げろソニ2019

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2707 | 僥倖ダンス | げろソニ2019 | 1 |
| song-3006 | 僥倖ダンス | げろソニ2019 | 1 |

### A-0324: "光" (3 entries, 5 perfs)
**Canonical**: "光" by 奏音69 feat.巡音ルカ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-964 | 光 | 奏音69 | 3 |
| song-373 | 光 | 奏音69 feat.巡音ルカ | 1 |
| song-1661 | 光 | 奏音69 feat.巡音ルカ | 1 |

### A-0325: "光の向こうへ" (2 entries, 9 perfs)
**Canonical**: "光の向こうへ" by HACHI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-214 | 光の向こうへ | HACHI | 8 |
| song-1284 | 光の向こうへ | HACHI-澁江夏奈 | 1 |

### A-0326: "光年之外" (2 entries, 3 perfs)
**Canonical**: "光年之外" by 鄧紫棋

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-422 | 光年之外 | 鄧紫棋 | 2 |
| song-2384 | 光年之外 | 鄧紫棋 | 1 |

### A-0327: "六等星の夜" (2 entries, 9 perfs)
**Canonical**: "六等星の夜" by Aimer

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-540 | 六等星の夜 | Aimer | 7 |
| song-1470 | 六等星の夜 | Aimer | 2 |

### A-0328: "再会" (2 entries, 3 perfs)
**Canonical**: "再会" by LiSA-Uru-Ayase

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-597 | 再会 | LiSA-Uru-Ayase | 2 |
| song-885 | 再会 | LiSA-Uru-Ayase (with 松永依織) | 1 |

### A-0329: "劣等上等" (2 entries, 4 perfs)
**Canonical**: "劣等上等" by ギガP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-804 | 劣等上等 | ギガP | 3 |
| song-2631 | 劣等上等 | ギガP (with 麵音白湯) | 1 |

### A-0330: "勿忘" (2 entries, 9 perfs)
**Canonical**: "勿忘" by Awesome City Club

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1554 | 勿忘 | Awesome City Club | 8 |
| song-1463 | 勿忘 | Awesome City Club | 1 |

### A-0331: "千年之戀" (2 entries, 3 perfs)
**Canonical**: "千年之戀" by 信樂團

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2270 | 千年之戀 | 信樂團 | 2 |
| song-2968 | 千年之戀 | 信樂團 | 1 |

### A-0332: "千本桜" (2 entries, 5 perfs)
**Canonical**: "千本桜" by 黒うさP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-107 | 千本桜 | 黒うさP | 4 |
| song-163 | 千本桜 | 黒うさP feat. 初音ミク | 1 |

### A-0333: "午夜恰恰" (2 entries, 2 perfs)
**Canonical**: "午夜恰恰" by 劉至佳 & 鄧典

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1824 | 午夜恰恰 | 劉至佳 & 鄧典 | 1 |
| song-2711 | 午夜恰恰 | 劉至佳 & 鄧典 | 1 |

### A-0334: "可不可以" (2 entries, 6 perfs)
**Canonical**: "可不可以" by 銀臨

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-304 | 可不可以 | 銀臨 | 5 |
| song-1891 | 可不可以 | 銀臨 | 1 |

### A-0335: "可愛くてごめん" (2 entries, 6 perfs)
**Canonical**: "可愛くてごめん" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1456 | 可愛くてごめん | HoneyWorks | 5 |
| song-2573 | 可愛くてごめん | HoneyWorks | 1 |

### A-0336: "名前のない怪物" (2 entries, 2 perfs)
**Canonical**: "名前のない怪物" by EGOIST

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-696 | 名前のない怪物 | EGOIST-ryo（supercell） | 1 |
| song-2529 | 名前のない怪物 | EGOIST | 1 |

### A-0337: "君の知らない物語" (2 entries, 4 perfs)
**Canonical**: "君の知らない物語" by supercell

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-3 | 君の知らない物語 | supercell | 3 |
| song-2109 | 君の知らない物語 | supercell | 1 |

### A-0338: "君の脈で踊りたかった" (2 entries, 3 perfs)
**Canonical**: "君の脈で踊りたかった" by ピコン

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1993 | 君の脈で踊りたかった | ピコン | 2 |
| song-2856 | 君の脈で踊りたかった | ピコン ft. 初音ミク | 1 |

### A-0339: "命運火焰" (2 entries, 2 perfs)
**Canonical**: "命運火焰" by 詹雯婷 Faye

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-32 | 命運火焰 | 詹雯婷 Faye | 1 |
| song-1850 | 命運火焰 | 詹雯婷 Faye | 1 |

### A-0340: "喜歡你" (2 entries, 4 perfs)
**Canonical**: "喜歡你" by 陳潔儀 Kit Chan

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1278 | 喜歡你 | 陳潔儀 Kit Chan | 3 |
| song-229 | 喜歡你 | 陳潔儀 | 1 |

### A-0341: "囍" (2 entries, 3 perfs)
**Canonical**: "囍" by 葛東琪

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-720 | 囍 | 葛東琪 | 2 |
| song-1827 | 囍 | 葛東琪 | 1 |

### A-0342: "回る空うさぎ" (2 entries, 4 perfs)
**Canonical**: "回る空うさぎ" by Orangestar

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-911 | 回る空うさぎ | Orangestar | 3 |
| song-268 | 回る空うさぎ | Orangestar ft. 初音ミク | 1 |

### A-0343: "因為愛情" (2 entries, 3 perfs)
**Canonical**: "因為愛情" by 陳奕迅 & 王菲

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2370 | 因為愛情 | 陳奕迅 & 王菲 | 2 |
| song-2969 | 因為愛情 | 陳奕迅 & 王菲 | 1 |

### A-0344: "在加納共和國離婚" (3 entries, 3 perfs)
**Canonical**: "在加納共和國離婚" by 大穎 & 菲道爾

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2825 | 在加納共和國離婚 | DIOR 大穎 & 菲道爾 ft. 漏打 Loda | 1 |
| song-2912 | 在加納共和國離婚 | DIOR大穎 & 菲道爾 | 1 |
| song-3129 | 在加納共和國離婚 | 大穎 & 菲道爾 | 1 |

### A-0345: "地球をあげる" (2 entries, 2 perfs)
**Canonical**: "地球をあげる" by はるまきごはん-LUMi

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-595 | 地球をあげる | はるまきごはん-LUMi | 1 |
| song-2625 | 地球をあげる | はるまきごはん (with 水縹そまる) | 1 |

### A-0346: "地球最後の告白を" (3 entries, 8 perfs)
**Canonical**: "地球最後の告白を" by kemu ft.GUMI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1168 | 地球最後の告白を | kemu | 6 |
| song-33 | 地球最後の告白を | kemu ft.GUMI | 1 |
| song-481 | 地球最後の告白を | kemu ft.GUMI | 1 |

### A-0347: "堪折" (3 entries, 4 perfs)
**Canonical**: "堪折" by Ring

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1907 | 堪折 | Ring | 2 |
| song-2664 | 堪折 | Ring 誓約之聲 | 1 |
| song-3098 | 堪折 | Ring誓約之聲 | 1 |

### A-0348: "填空" (2 entries, 3 perfs)
**Canonical**: "填空" by 家家

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1333 | 填空 | 家家 | 2 |
| song-1779 | 填空 | 家家 | 1 |

### A-0349: "夜もすがら君想ふ" (3 entries, 4 perfs)
**Canonical**: "夜もすがら君想ふ" by 西沢さんP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-987 | 夜もすがら君想ふ | 西沢さんP | 2 |
| song-785 | 夜もすがら君想ふ | 西沢さんP | 1 |
| song-1634 | 夜もすがら君想ふ | 西沢さんP | 1 |

### A-0350: "夜咄ディセイブ" (2 entries, 4 perfs)
**Canonical**: "夜咄ディセイブ" by じん

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1047 | 夜咄ディセイブ | じん | 3 |
| song-2643 | 夜咄ディセイブ | じん (with 瓦西瓦瓦) | 1 |

### A-0351: "夢中人" (2 entries, 4 perfs)
**Canonical**: "夢中人" by 王菲

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1277 | 夢中人 | 王菲 | 3 |
| song-1075 | 夢中人 | 王菲 | 1 |

### A-0352: "夢灯籠" (2 entries, 2 perfs)
**Canonical**: "夢灯籠" by RADWIMPS

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-996 | 夢灯籠 | RADWIMPS | 1 |
| song-3076 | 夢灯籠 | RADWIMPS | 1 |

### A-0353: "大嫌いなはずだった。" (2 entries, 2 perfs)
**Canonical**: "大嫌いなはずだった。" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-736 | 大嫌いなはずだった。 | /HoneyWorks | 1 |
| song-1365 | 大嫌いなはずだった。 | HoneyWorks | 1 |

### A-0354: "大掃除" (2 entries, 3 perfs)
**Canonical**: "大掃除" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1950 | 大掃除 | DECO*27 | 2 |
| song-1091 | 大掃除 | DECO*27 | 1 |

### A-0355: "大眠" (2 entries, 2 perfs)
**Canonical**: "大眠" by 王心凌

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2389 | 大眠 | 王心凌 | 1 |
| song-2570 | 大眠 | 王心凌 | 1 |

### A-0356: "大藝術家" (2 entries, 2 perfs)
**Canonical**: "大藝術家" by 蔡依林

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1237 | 大藝術家 | 蔡依林 | 1 |
| song-2624 | 大藝術家 | 蔡依林 (with 洛可洛斯特) | 1 |

### A-0357: "大魚" (2 entries, 5 perfs)
**Canonical**: "大魚" by 周深

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-204 | 大魚 | 周深 | 4 |
| song-2638 | 大魚 | 周深 (with 沐橙) | 1 |

### A-0358: "天ノ弱" (2 entries, 7 perfs)
**Canonical**: "天ノ弱" by 164

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-88 | 天ノ弱 | 164 | 6 |
| song-1572 | 天ノ弱 | 164 feat.GUMI | 1 |

### A-0359: "天文特徵" (2 entries, 2 perfs)
**Canonical**: "天文特徵" by HUSH

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2683 | 天文特徵 | HUSH! | 1 |
| song-3048 | 天文特徵 | HUSH | 1 |

### A-0360: "太陽" (2 entries, 2 perfs)
**Canonical**: "太陽" by 邱振哲

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1611 | 太陽 | 邱振哲 | 1 |
| song-2569 | 太陽 | 邱振哲 | 1 |

### A-0361: "失戀慶功宴" (3 entries, 5 perfs)
**Canonical**: "失戀慶功宴" by 魚乾

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2303 | 失戀慶功宴 | 魚乾 | 3 |
| song-1021 | 失戀慶功宴 | 魚乾 (SLSMusic伴奏) | 1 |
| song-1644 | 失戀慶功宴 | 魚乾 | 1 |

### A-0362: "失眠飛行" (4 entries, 5 perfs)
**Canonical**: "失眠飛行" by 接個吻，開一槍 & 沈以誠 & 薛明媛

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2015 | 失眠飛行 | 接個吻，開一槍 & 沈以誠 & 薛明媛 | 2 |
| song-1883 | 失眠飛行 | 接個吻，開一槍 & 沈以誠 & 薛明媛 | 1 |
| song-2930 | 失眠飛行 | 接個吻， 開一槍 & 沈以誠 & 薛明媛 | 1 |
| song-3061 | 失眠飛行 | 接個吻， 開一槍、沈以誠 、薛明媛 | 1 |

### A-0363: "失落沙洲" (2 entries, 2 perfs)
**Canonical**: "失落沙洲" by 徐佳瑩

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-298 | 失落沙洲 | 徐佳瑩 | 1 |
| song-2388 | 失落沙洲 | 徐佳瑩 | 1 |

### A-0364: "女々しくて" (2 entries, 2 perfs)
**Canonical**: "女々しくて" by ゴールデンボンバー

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-417 | 女々しくて | ゴールデンボンバー | 1 |
| song-1076 | 女々しくて | ゴールデンボンバー | 1 |

### A-0365: "好嗎好嗎" (3 entries, 3 perfs)
**Canonical**: "好嗎好嗎" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1243 | 好嗎好嗎 | 魏如萱 waa wei | 1 |
| song-2300 | 好嗎好嗎 | 魏如萱 | 1 |
| song-3174 | 好嗎好嗎 | 魏如萱 | 1 |

### A-0366: "妄想税" (2 entries, 2 perfs)
**Canonical**: "妄想税" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1598 | 妄想税 | DECO*27 | 1 |
| song-2206 | 妄想税 | DECO*27 | 1 |

### A-0367: "孤獨頌歌" (2 entries, 4 perfs)
**Canonical**: "孤獨頌歌" by 陳文非

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1511 | 孤獨頌歌 | 陳文非 | 3 |
| song-1610 | 孤獨頌歌 | 陳文非 | 1 |

### A-0368: "寄り酔い" (2 entries, 7 perfs)
**Canonical**: "寄り酔い" by 和ぬか

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1398 | 寄り酔い | 和ぬか | 4 |
| song-119 | 寄り酔い | 和ぬか-100回嘔吐 | 3 |

### A-0369: "寶貝" (2 entries, 7 perfs)
**Canonical**: "寶貝" by 張懸

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-308 | 寶貝 | 張懸 | 6 |
| song-1608 | 寶貝 | 張懸 | 1 |

### A-0370: "對等關係" (2 entries, 2 perfs)
**Canonical**: "對等關係" by 李榮浩 & 張惠妹

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2385 | 對等關係 | 李榮浩 & 張惠妹 | 1 |
| song-2948 | 對等關係 | 李榮浩 & 張惠妹 | 1 |

### A-0371: "小丑的品格" (2 entries, 2 perfs)
**Canonical**: "小丑的品格" by 泠鳶yousa

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1312 | 小丑的品格 | 泠鳶yousa-怪盗V-Leon | 1 |
| song-2158 | 小丑的品格 | 泠鳶yousa | 1 |

### A-0372: "小夜子" (2 entries, 6 perfs)
**Canonical**: "小夜子" by みきとP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-825 | 小夜子 | みきとP | 5 |
| song-2855 | 小夜子 | みきとP  ft. 初音ミク | 1 |

### A-0373: "小幸運" (2 entries, 2 perfs)
**Canonical**: "小幸運" by 田馥甄《我的少女時代》

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-405 | 小幸運 | 田馥甄《我的少女時代》 | 1 |
| song-3173 | 小幸運 | 田馥甄《我的少女時代》 | 1 |

### A-0374: "小情歌" (2 entries, 3 perfs)
**Canonical**: "小情歌" by 蘇打綠

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2522 | 小情歌 | 蘇打綠 | 2 |
| song-1279 | 小情歌 | 蘇打綠 sodagreen | 1 |

### A-0375: "小手拉大手" (2 entries, 2 perfs)
**Canonical**: "小手拉大手" by 梁靜茹-辻亞彌乃

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1130 | 小手拉大手 | 梁靜茹-辻亞彌乃 | 1 |
| song-2622 | 小手拉大手 | 梁靜茹 (with 紫茗) | 1 |

### A-0376: "山海" (2 entries, 3 perfs)
**Canonical**: "山海" by 草東沒有派對

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1240 | 山海 | 草東沒有派對 | 2 |
| song-1784 | 山海 | 草東沒有派對 | 1 |

### A-0377: "左手指月" (2 entries, 5 perfs)
**Canonical**: "左手指月" by 薩頂頂

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-159 | 左手指月 | 薩頂頂 | 4 |
| song-1778 | 左手指月 | 薩頂頂 | 1 |

### A-0378: "平凡的一天" (2 entries, 4 perfs)
**Canonical**: "平凡的一天" by 毛不易

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1249 | 平凡的一天 | 毛不易 | 3 |
| song-1888 | 平凡的一天 | 毛不易 | 1 |

### A-0379: "年輪" (2 entries, 3 perfs)
**Canonical**: "年輪" by 張碧晨

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-719 | 年輪 | 張碧晨 | 2 |
| song-2387 | 年輪 | 張碧晨 | 1 |

### A-0380: "幸せ。" (2 entries, 3 perfs)
**Canonical**: "幸せ。" by CHiCO with HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-55 | 幸せ。 | CHiCO with HoneyWorks | 2 |
| song-1467 | 幸せ。 | CHiCO with HoneyWorks | 1 |

### A-0381: "彼個所在" (2 entries, 5 perfs)
**Canonical**: "彼個所在" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2401 | 彼個所在 | 魏如萱 | 4 |
| song-3081 | 彼個所在 | 魏如萱 | 1 |

### A-0382: "心のそばに" (3 entries, 7 perfs)
**Canonical**: "心のそばに" by Belle

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-478 | 心のそばに | Belle | 3 |
| song-2426 | 心のそばに | Belle（CV：中村佳穗） | 3 |
| song-2028 | 心のそばに | Belle（中村佳穂） | 1 |

### A-0383: "心做し" (2 entries, 13 perfs)
**Canonical**: "心做し" by 蝶々P

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-208 | 心做し | 蝶々P | 11 |
| song-2770 | 心做し | 蝶々P ft. GUMI | 2 |

### A-0384: "忘れじの言の葉" (3 entries, 3 perfs)
**Canonical**: "忘れじの言の葉" by 未来古代楽団 ft. 安次嶺希和子

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-307 | 忘れじの言の葉 | 未来古代楽団 ft. 安次嶺希和子 | 1 |
| song-1637 | 忘れじの言の葉 | 未来古代楽団 ft. 安次嶺希和子 | 1 |
| song-2358 | 忘れじの言の葉 | 未来古代楽団 feat. 安次嶺希和子 | 1 |

### A-0385: "怪物さん" (2 entries, 2 perfs)
**Canonical**: "怪物さん" by 平井堅 ft.あいみょん

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2155 | 怪物さん | 平井堅 feat. あいみょん | 1 |
| song-2434 | 怪物さん | 平井堅 ft.あいみょん | 1 |

### A-0386: "怪獣の花唄" (2 entries, 5 perfs)
**Canonical**: "怪獣の花唄" by Vaundy

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-206 | 怪獣の花唄 | Vaundy | 4 |
| song-2633 | 怪獣の花唄 | Vaundy (with 玖宵) | 1 |

### A-0387: "恋" (2 entries, 4 perfs)
**Canonical**: "恋" by 星野源

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-974 | 恋 | 星野源 | 3 |
| song-1635 | 恋 | 星野源 | 1 |

### A-0388: "恋はきっと急上昇" (2 entries, 2 perfs)
**Canonical**: "恋はきっと急上昇" by のぼる↑P

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1366 | 恋はきっと急上昇 | のぼる↑P | 1 |
| song-3011 | 恋はきっと急上昇 | のぼる↑ | 1 |

### A-0389: "想見你想見你想見你" (3 entries, 3 perfs)
**Canonical**: "想見你想見你想見你" by 八三夭

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-126 | 想見你想見你想見你 | 八三夭 831 | 1 |
| song-1951 | 想見你想見你想見你 | 八三夭 | 1 |
| song-2108 | 想見你想見你想見你 | 八三夭 | 1 |

### A-0390: "愛して愛して愛して" (2 entries, 3 perfs)
**Canonical**: "愛して愛して愛して" by きくお

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-34 | 愛して愛して愛して | きくお | 2 |
| song-7 | 愛して愛して愛して | きくお feat. 初音ミク | 1 |

### A-0391: "愛にできることはまだあるかい" (3 entries, 5 perfs)
**Canonical**: "愛にできることはまだあるかい" by RADWIMPS

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-134 | 愛にできることはまだあるかい | RADWIMPS | 3 |
| song-1968 | 愛にできることはまだあるかい | RADWIMPS (天気の子) | 1 |
| song-3178 | 愛にできることはまだあるかい | RADWIMPS | 1 |

### A-0392: "愛に出会い恋は続く" (2 entries, 3 perfs)
**Canonical**: "愛に出会い恋は続く" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-740 | 愛に出会い恋は続く | HoneyWorks | 2 |
| song-2811 | 愛に出会い恋は続く | HoneyWorks ft. Kotoha | 1 |

### A-0393: "愛的華爾滋" (2 entries, 2 perfs)
**Canonical**: "愛的華爾滋" by 鄭爽

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1336 | 愛的華爾滋 | 鄭爽 | 1 |
| song-3014 | 愛的華爾滋 | 鄭爽 & 俞灝明 | 1 |

### A-0394: "愛言葉Ⅲ" (2 entries, 2 perfs)
**Canonical**: "愛言葉Ⅲ" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-53 | 愛言葉Ⅲ | DECO*27 feat. 初音ミク | 1 |
| song-2525 | 愛言葉Ⅲ | DECO*27 | 1 |

### A-0395: "愛言葉Ⅳ" (2 entries, 7 perfs)
**Canonical**: "愛言葉Ⅳ" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-931 | 愛言葉Ⅳ | DECO*27 | 6 |
| song-1832 | 愛言葉IV | DECO*27 | 1 |

### A-0396: "慢慢喜歡你" (3 entries, 5 perfs)
**Canonical**: "慢慢喜歡你" by 莫文蔚

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1153 | 慢慢喜歡你 | 莫文蔚 | 3 |
| song-1466 | 慢慢喜歡你 | 莫文蔚 | 1 |
| song-2649 | 慢慢喜歡你 | 莫文蔚 (with 浠Mizuki) | 1 |

### A-0397: "我們一樣可惜" (2 entries, 2 perfs)
**Canonical**: "我們一樣可惜" by 好樂團

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1181 | 我們一樣可惜 | 好樂團 | 1 |
| song-3080 | 我們一樣可惜 | 好樂團 | 1 |

### A-0398: "我喜歡你" (2 entries, 2 perfs)
**Canonical**: "我喜歡你" by 洪安妮

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1557 | 我喜歡你 | 洪安妮 | 1 |
| song-2975 | 我喜歡你 | 洪安妮 | 1 |

### A-0399: "我想你要走了" (2 entries, 2 perfs)
**Canonical**: "我想你要走了" by 張懸

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1316 | 我想你要走了 | 張懸 | 1 |
| song-2120 | 我想你要走了 | 張懸 | 1 |

### A-0400: "我是一隻小小鳥" (2 entries, 2 perfs)
**Canonical**: "我是一隻小小鳥" by 趙傳

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-871 | 我是一隻小小鳥 | 趙傳-李宗盛 | 1 |
| song-3087 | 我是一隻小小鳥 | 趙傳 | 1 |

### A-0401: "我的歌聲裡" (2 entries, 2 perfs)
**Canonical**: "我的歌聲裡" by 曲婉婷

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-350 | 我的歌聲裡 | 曲婉婷 | 1 |
| song-790 | 我的歌聲裡 | 曲婉婷 Wanting | 1 |

### A-0402: "我要我們在一起" (2 entries, 3 perfs)
**Canonical**: "我要我們在一起" by 范曉萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1745 | 我要我們在一起 | 范曉萱 | 2 |
| song-3086 | 我要我們在一起 | 范曉萱 | 1 |

### A-0403: "我要飛" (2 entries, 2 perfs)
**Canonical**: "我要飛" by F.I.R.飛兒樂團

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-252 | 我要飛 | F.I.R.飛兒樂團 | 1 |
| song-1025 | 我要飛 | F.I.R./飛兒樂團 | 1 |

### A-0404: "所念皆星河" (2 entries, 11 perfs)
**Canonical**: "所念皆星河" by 房東的貓

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-306 | 所念皆星河 | 房東的貓 | 9 |
| song-1659 | 所念皆星河 | 房東的貓 | 2 |

### A-0405: "手心的薔薇" (3 entries, 3 perfs)
**Canonical**: "手心的薔薇" by 林俊傑

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1890 | 手心的薔薇 | 林俊傑 | 1 |
| song-2371 | 手心的薔薇 | 林俊傑 | 1 |
| song-2914 | 手心的薔薇 | 林俊傑 feat.鄧紫棋 | 1 |

### A-0406: "打上花火" (4 entries, 4 perfs)
**Canonical**: "打上花火" by DAOKO × 米津玄師

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1465 | 打上花火 | DAOKO × 米津玄師 | 1 |
| song-1563 | 打上花火 | DAOKO × 米津玄師 | 1 |
| song-1833 | 打上花火 | DAOKO×米津玄師 | 1 |
| song-2897 | 打上花火 | DAOKO & 米津玄師 | 1 |

### A-0407: "披星戴月的想你" (2 entries, 6 perfs)
**Canonical**: "披星戴月的想你" by 告五人

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-534 | 披星戴月的想你 | 告五人 | 5 |
| song-532 | 披星戴月的想你 | 告五人 | 1 |

### A-0408: "敗北の少年" (2 entries, 2 perfs)
**Canonical**: "敗北の少年" by kemu

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-981 | 敗北の少年 | kemu | 1 |
| song-2467 | 敗北の少年 | kemu | 1 |

### A-0409: "斑馬斑馬" (2 entries, 3 perfs)
**Canonical**: "斑馬斑馬" by 宋冬野

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-939 | 斑馬斑馬 | 宋冬野 | 2 |
| song-2393 | 斑馬斑馬 | 宋冬野 | 1 |

### A-0410: "新時代" (2 entries, 4 perfs)
**Canonical**: "新時代" by Ado

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-993 | 新時代 | Ado | 3 |
| song-2774 | 新時代 | ADO | 1 |

### A-0411: "星屑ビーナス" (2 entries, 4 perfs)
**Canonical**: "星屑ビーナス" by Aimer

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1035 | 星屑ビーナス | Aimer | 3 |
| song-1660 | 星屑ビーナス | Aimer | 1 |

### A-0412: "星期三或禮拜三" (2 entries, 4 perfs)
**Canonical**: "星期三或禮拜三" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-938 | 星期三或禮拜三 | 魏如萱 | 2 |
| song-2463 | 星期三或禮拜三 | 魏如萱 & 岑寧兒 | 2 |

### A-0413: "星間飛行" (2 entries, 5 perfs)
**Canonical**: "星間飛行" by 中島愛

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-917 | 星間飛行 | 中島愛 | 3 |
| song-1626 | 星間飛行 | 中島愛 | 2 |

### A-0414: "星願" (2 entries, 2 perfs)
**Canonical**: "星願" by 王心凌

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2087 | 星願 | 王心凌 | 1 |
| song-3144 | 星願 | 王心凌 | 1 |

### A-0415: "春を告げる" (2 entries, 2 perfs)
**Canonical**: "春を告げる" by yama

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-491 | 春を告げる | yama | 1 |
| song-1521 | 春を告げる | Yama | 1 |

### A-0416: "晚安晚安" (2 entries, 6 perfs)
**Canonical**: "晚安晚安" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-569 | 晚安晚安 | 魏如萱 | 4 |
| song-1480 | 晚安晚安 | 魏如萱 | 2 |

### A-0417: "晚安歌" (2 entries, 3 perfs)
**Canonical**: "晚安歌" by 陳嘉樺

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1432 | 晚安歌 | 陳嘉樺 | 2 |
| song-1614 | 晚安歌 | 陳嘉樺 | 1 |

### A-0418: "晚餐歌" (3 entries, 8 perfs)
**Canonical**: "晚餐歌" by tuki.

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2104 | 晚餐歌 | tuki. | 4 |
| song-302 | 晚餐歌 | Tuki. | 2 |
| song-1928 | 晚餐歌 | tuki | 2 |

### A-0419: "晩餐歌" (2 entries, 8 perfs)
**Canonical**: "晩餐歌" by tuki.

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2032 | 晩餐歌 | tuki. | 7 |
| song-2640 | 晩餐歌 | tuki. (with 涅默) | 1 |

### A-0420: "暖心" (2 entries, 2 perfs)
**Canonical**: "暖心" by 郁可唯

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1560 | 暖心 | 郁可唯 | 1 |
| song-3078 | 暖心 | 郁可唯 | 1 |

### A-0421: "曇天" (3 entries, 3 perfs)
**Canonical**: "曇天" by DOES

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-882 | 曇天 | DOES-氏原ワタル (with 歐貝爾) | 1 |
| song-2530 | 曇天 | DOES | 1 |
| song-2626 | 曇天 | DOES (with 祈菈‧貝希毛絲) | 1 |

### A-0422: "月光" (2 entries, 2 perfs)
**Canonical**: "月光" by 王心凌

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2088 | 月光 | 王心凌 | 1 |
| song-3030 | 月光 | 王心凌 | 1 |

### A-0423: "月牙灣" (3 entries, 5 perfs)
**Canonical**: "月牙灣" by F.I.R. 飛兒樂團

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1603 | 月牙灣 | F.I.R. 飛兒樂團 | 2 |
| song-1876 | 月牙灣 | F.I.R.飛兒樂團 | 2 |
| song-921 | 月牙灣 | F.I.R. 飛兒樂團 | 1 |

### A-0424: "有點甜" (5 entries, 5 perfs)
**Canonical**: "有點甜" by 汪蘇瀧&By2

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-142 | 有點甜 | 汪蘇瀧&By2 | 1 |
| song-886 | 有點甜 | 汪蘇瀧&By2 (with KSP) | 1 |
| song-1893 | 有點甜 | 汪蘇瀧&By2 | 1 |
| song-2492 | 有點甜 | 汪蘇瀧 & By2 | 1 |
| song-2944 | 有點甜 | 汪蘇瀧 & BY2 | 1 |

### A-0425: "木蘭行" (2 entries, 3 perfs)
**Canonical**: "木蘭行" by 忘川風華錄

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-709 | 木蘭行 | 忘川風華錄 | 2 |
| song-1656 | 木蘭行 | 忘川風華錄 | 1 |

### A-0426: "未知未踏アルスハイル" (2 entries, 11 perfs)
**Canonical**: "未知未踏アルスハイル" by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-824 | 未知未踏アルスハイル | 浠Mizuki | 9 |
| song-2732 | 未知未踏アルスハイル | 浠 Mizuki | 2 |

### A-0427: "桜華残響" (2 entries, 6 perfs)
**Canonical**: "桜華残響" by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2191 | 桜華残響 | 浠Mizuki | 5 |
| song-2730 | 桜華残響 | 浠 Mizuki | 1 |

### A-0428: "極光的風" (2 entries, 2 perfs)
**Canonical**: "極光的風" by 香蓮

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-706 | 極光的風 | 香蓮-大内哲也 | 1 |
| song-2201 | 極光的風 | 香蓮 | 1 |

### A-0429: "歌に形はないけれど" (2 entries, 2 perfs)
**Canonical**: "歌に形はないけれど" by doriko

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1664 | 歌に形はないけれど | doriko | 1 |
| song-2147 | 歌に形はないけれど | doriko | 1 |

### A-0430: "正想著你呢" (2 entries, 4 perfs)
**Canonical**: "正想著你呢" by 持修

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1712 | 正想著你呢 | 持修 | 3 |
| song-1788 | 正想著你呢 | 持修 | 1 |

### A-0431: "正直日記" (2 entries, 4 perfs)
**Canonical**: "正直日記" by 美波

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-254 | 正直日記 | 美波 | 3 |
| song-3182 | 正直日記 | 美波 | 1 |

### A-0432: "残響散歌" (2 entries, 6 perfs)
**Canonical**: "残響散歌" by Aimer

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-984 | 残響散歌 | Aimer | 4 |
| song-87 | 残響散歌 | Aimer | 2 |

### A-0433: "殘酷な天使のテーゼ" (2 entries, 2 perfs)
**Canonical**: "殘酷な天使のテーゼ" by 高橋洋子

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-455 | 殘酷な天使のテーゼ | 高橋洋子 | 1 |
| song-880 | 殘酷な天使のテーゼ | 高橋洋子 (with 海唧 ) | 1 |

### A-0434: "殘響散歌" (2 entries, 2 perfs)
**Canonical**: "殘響散歌" by Aimer

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1774 | 殘響散歌 | Aimer | 1 |
| song-2690 | 殘響散歌 | Aimer | 1 |

### A-0435: "母系社會" (2 entries, 2 perfs)
**Canonical**: "母系社會" by A-MIT

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-384 | 母系社會 | AMIT（清唱） | 1 |
| song-934 | 母系社會 | A-MIT | 1 |

### A-0436: "永不失聯的愛" (2 entries, 5 perfs)
**Canonical**: "永不失聯的愛" by 周興哲

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1472 | 永不失聯的愛 | 周興哲 | 3 |
| song-393 | 永不失聯的愛 | 周興哲 | 2 |

### A-0437: "永遠前夜" (2 entries, 2 perfs)
**Canonical**: "永遠前夜" by TENBLANK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-357 | 永遠前夜 | TENBLANK | 1 |
| song-3164 | 永遠前夜 | TENBLANK (浠Mizuki) | 1 |

### A-0438: "求救訊號" (2 entries, 3 perfs)
**Canonical**: "求救訊號" by Vast & Hazy

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2662 | 求救訊號 | Vast & Hazy | 2 |
| song-278 | 求救訊號 | Vast & Hazy (VH) | 1 |

### A-0439: "泣き出しそうだよ" (2 entries, 2 perfs)
**Canonical**: "泣き出しそうだよ" by RADWIMPS

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-294 | 泣き出しそうだよ | RADWIMPS | 1 |
| song-1462 | 泣き出しそうだよ | RADWIMPS | 1 |

### A-0440: "浮誇" (2 entries, 2 perfs)
**Canonical**: "浮誇" by 陳奕迅

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1328 | 浮誇 | 陳奕迅 | 1 |
| song-1777 | 浮誇 | 陳奕迅 | 1 |

### A-0441: "海色" (2 entries, 3 perfs)
**Canonical**: "海色" by AKINO from bless4

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-436 | 海色 | AKINO from bless4 | 2 |
| song-1667 | 海色 | AKINO from bless4 | 1 |

### A-0442: "涼涼" (2 entries, 2 perfs)
**Canonical**: "涼涼" by 楊宗緯-張碧晨

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-722 | 涼涼 | 楊宗緯-張碧晨 | 1 |
| song-2932 | 涼涼 | 楊宗緯 & 張碧晨 | 1 |

### A-0443: "深昏睡" (2 entries, 5 perfs)
**Canonical**: "深昏睡" by 春野

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1174 | 深昏睡 | 春野 | 4 |
| song-1418 | 深昏睡 | 春野 ( haruno ) feat.初音ミク | 1 |

### A-0444: "渉り星" (4 entries, 9 perfs)
**Canonical**: "渉り星" by Islet

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1044 | 渉り星 | Islet | 4 |
| song-2396 | 渉り星 | Islet feat.Sando Aoi×Yoru | 3 |
| song-1758 | 渉り星 | Islet feat.Sando Aoi×夕凪夜 | 1 |
| song-2809 | 渉り星 | Islet ft.Sando Aoi×夕凪夜 | 1 |

### A-0445: "溫柔" (2 entries, 2 perfs)
**Canonical**: "溫柔" by 五月天

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1338 | 溫柔 | 五月天 | 1 |
| song-3071 | 溫柔 | 五月天 | 1 |

### A-0446: "溯Reverse" (4 entries, 4 perfs)
**Canonical**: "溯Reverse" by CORSAK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-236 | 溯Reverse | CORSAK 馬吟吟 | 1 |
| song-2103 | 溯Reverse | CORSAK | 1 |
| song-2860 | 溯Reverse | CORSAK ft. 馬吟吟 | 1 |
| song-2413 | 溯Reverse | CORSAK & 馬吟吟 | 1 |

### A-0447: "漫夜Sleepless" (2 entries, 4 perfs)
**Canonical**: "漫夜Sleepless" by 澪Rei

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2095 | 漫夜Sleepless | 澪Rei | 3 |
| song-2779 | 漫夜Sleepless | 澪 Rei | 1 |

### A-0448: "潜水花" (2 entries, 4 perfs)
**Canonical**: "潜水花" by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2339 | 潜水花 | 浠Mizuki | 3 |
| song-2722 | 潜水花 | 浠 Mizuki | 1 |

### A-0449: "濕了分寸" (2 entries, 5 perfs)
**Canonical**: "濕了分寸" by 謝震廷 Eli Hsieh

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-521 | 濕了分寸 | 謝震廷 Eli Hsieh | 3 |
| song-1722 | 濕了分寸 | 謝震廷 | 2 |

### A-0450: "灰色" (2 entries, 4 perfs)
**Canonical**: "灰色" by 徐佳瑩

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-386 | 灰色 | 徐佳瑩 | 3 |
| song-1885 | 灰色 | 徐佳瑩 | 1 |

### A-0451: "灰色と青" (4 entries, 4 perfs)
**Canonical**: "灰色と青" by 米津玄師-菅田将暉

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1220 | 灰色と青 | 米津玄師-菅田将暉 | 1 |
| song-2887 | 灰色と青 | 米津玄師 & 菅田将暉 | 1 |
| song-2017 | 灰色と青 | 米津玄師 & 菅田將暉 | 1 |
| song-2268 | 灰色と青 | 米津玄師 ft.菅田将暉 | 1 |

### A-0452: "炙愛" (2 entries, 2 perfs)
**Canonical**: "炙愛" by 陳忻玥

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2858 | 炙愛 | 陳忻玥 | 1 |
| song-3075 | 炙愛 | 陳忻玥 | 1 |

### A-0453: "点描の唄" (3 entries, 12 perfs)
**Canonical**: "点描の唄" by Mrs. GREEN APPLE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-148 | 点描の唄 | Mrs. GREEN APPLE | 10 |
| song-1458 | 点描の唄 | Mrs. GREEN APPLE | 1 |
| song-2628 | 点描の唄 | Mrs. GREEN APPLE (with 蘿貝塔) | 1 |

### A-0454: "焼け原" (2 entries, 3 perfs)
**Canonical**: "焼け原" by NARAKA: BLADEPOINT x NieR Main Theme

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2437 | 焼け原 | NARAKA: BLADEPOINT x NieR Main Theme | 2 |
| song-1864 | 焼け原 | NARAKA: BLADEPOINT x NieR Main Theme (Japanese Version) | 1 |

### A-0455: "熱戀情節" (2 entries, 2 perfs)
**Canonical**: "熱戀情節" by 吳子健REmi & KIYA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2408 | 熱戀情節 | 吳子健REmi & KIYA | 1 |
| song-2899 | 熱戀情節 | 吳子健Remi & Kiya | 1 |

### A-0456: "燈光" (2 entries, 4 perfs)
**Canonical**: "燈光" by 謝震廷

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-297 | 燈光 | 謝震廷 | 2 |
| song-1748 | 燈光 | 謝震廷 | 2 |

### A-0457: "特務J" (2 entries, 3 perfs)
**Canonical**: "特務J" by 蔡依林

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-301 | 特務J | 蔡依林 | 2 |
| song-1760 | 特務J | 蔡依林 | 1 |

### A-0458: "独りんぼエンヴィー" (2 entries, 3 perfs)
**Canonical**: "独りんぼエンヴィー" by 電ポルP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1216 | 独りんぼエンヴィー | 電ポルP | 2 |
| song-1776 | 独りんぼエンヴィー | 電ポルP | 1 |

### A-0459: "猫" (2 entries, 4 perfs)
**Canonical**: "猫" by DISH//

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-875 | 猫 | DISH//-あいみょん | 2 |
| song-1994 | 猫 | DISH// | 2 |

### A-0460: "獨上C樓" (3 entries, 4 perfs)
**Canonical**: "獨上C樓" by YELLOW & 范曉萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2215 | 獨上C樓 | YELLOW & 范曉萱 | 2 |
| song-1303 | 獨上C樓 | YELLOW黃宣 | 1 |
| song-2366 | 獨上C樓 | YELLOW | 1 |

### A-0461: "玫瑰少年" (3 entries, 5 perfs)
**Canonical**: "玫瑰少年" by 蔡依林

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2023 | 玫瑰少年 | 蔡依林 | 3 |
| song-1223 | 玫瑰少年 | 蔡依林 Jolin Tsai | 1 |
| song-2617 | 玫瑰少年 | 蔡依林 (with 涅菈) | 1 |

### A-0462: "番凩" (2 entries, 2 perfs)
**Canonical**: "番凩" by MEIKO・KAITO

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-859 | 番凩 | MEIKO・KAITO | 1 |
| song-982 | 番凩 | MEIKO・KAITO | 1 |

### A-0463: "畫地為牢" (3 entries, 5 perfs)
**Canonical**: "畫地為牢" by 云の泣 & 葉里

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1282 | 畫地為牢 | 云の泣 & 葉里 | 3 |
| song-1311 | 畫地為牢 | 云の泣-葉里 | 1 |
| song-2903 | 畫地為牢 | 雲の泣 & 葉里 | 1 |

### A-0464: "病名は愛だった" (2 entries, 3 perfs)
**Canonical**: "病名は愛だった" by Neru・z'5

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1117 | 病名は愛だった | Neru・z'5 | 2 |
| song-2916 | 病名は愛だった | Neru & z'5 | 1 |

### A-0465: "白 my Side" (2 entries, 2 perfs)
**Canonical**: "白 my Side" by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2846 | 白 my Side | 浠Mizuki | 1 |
| song-3028 | 白 My Side | 浠Mizuki | 1 |

### A-0466: "白日夢" (2 entries, 3 perfs)
**Canonical**: "白日夢" by Islet

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1795 | 白日夢 | Islet | 2 |
| song-2812 | 白日夢 | Islet ft. 倚水 | 1 |

### A-0467: "直到我遇見了你" (3 entries, 3 perfs)
**Canonical**: "直到我遇見了你" by 李友廷

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-662 | 直到我遇見了你 | 李友廷 Yo Lee | 1 |
| song-1346 | 直到我遇見了你 | 李友廷 | 1 |
| song-1828 | 直到我遇見了你 | 李友廷 | 1 |

### A-0468: "真っ白" (2 entries, 3 perfs)
**Canonical**: "真っ白" by yama

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2232 | 真っ白 | yama | 2 |
| song-2578 | 真っ白 | Yama | 1 |

### A-0469: "真夜中のドア〜stay with me" (2 entries, 3 perfs)
**Canonical**: "真夜中のドア〜stay with me" by 松原みき

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2956 | 真夜中のドア〜stay with me | 松原みき | 2 |
| song-3126 | 真夜中のドア〜Stay With Me | 松原みき | 1 |

### A-0470: "真的没喝多" (2 entries, 2 perfs)
**Canonical**: "真的没喝多" by B2$

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1715 | 真的没喝多 | B2$,KOALA | 1 |
| song-1819 | 真的没喝多 | B2$ | 1 |

### A-0471: "知足" (2 entries, 2 perfs)
**Canonical**: "知足" by 五月天 (with 漏打)

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2111 | 知足 | 五月天 (with 漏打) | 1 |
| song-2618 | 知足 | 五月天 (with 漏打) | 1 |

### A-0472: "碼頭姑娘" (2 entries, 3 perfs)
**Canonical**: "碼頭姑娘" by 劉芷融

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-391 | 碼頭姑娘 | 劉芷融 | 2 |
| song-783 | 碼頭姑娘 | 劉芷融-江東昱-楊適維-張衛帆 | 1 |

### A-0473: "神っぽいな" (3 entries, 9 perfs)
**Canonical**: "神っぽいな" by ピノキオピー

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-629 | 神っぽいな | ピノキオピー | 7 |
| song-1768 | 神っぽいな | ピノキオピー | 1 |
| song-773 | 神っぽいな | ピノキオピ | 1 |

### A-0474: "神のまにまに" (2 entries, 4 perfs)
**Canonical**: "神のまにまに" by れるりり

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-863 | 神のまにまに | れるりり | 3 |
| song-2635 | 神のまにまに | れるりり (with sazki) | 1 |

### A-0475: "神のまにまに" (2 entries, 2 perfs)
**Canonical**: "神のまにまに" by れるりりfeat.ミク&リン&GUMI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1657 | 神のまにまに | れるりりfeat.ミク&リン&GUMI | 1 |
| song-2673 | 神のまにまに | れるりりfeat.ミク&リン&GUMI | 1 |

### A-0476: "神の名前に堕ちる者" (2 entries, 3 perfs)
**Canonical**: "神の名前に堕ちる者" by kaoling

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2452 | 神の名前に堕ちる者 | kaoling | 2 |
| song-1740 | 神の名前に堕ちる者 | kaoling | 1 |

### A-0477: "神ぽいな" (2 entries, 2 perfs)
**Canonical**: "神ぽいな" by ピノキオピー

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-729 | 神ぽいな | ピノキオピー | 1 |
| song-1291 | 神ぽいな | ピノキオピ | 1 |

### A-0478: "私は最強" (3 entries, 8 perfs)
**Canonical**: "私は最強" by Ado

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-348 | 私は最強 | Ado | 6 |
| song-2613 | 私は最強 | Ado (with 流川莉蘿) | 1 |
| song-2727 | 私は最強 | ADO | 1 |

### A-0479: "粉雪" (2 entries, 4 perfs)
**Canonical**: "粉雪" by レミオロメン

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1080 | 粉雪 | レミオロメン | 3 |
| song-228 | 粉雪 | レミオロメン | 1 |

### A-0480: "粛聖!!ロリ神レクイエム" (2 entries, 4 perfs)
**Canonical**: "粛聖!!ロリ神レクイエム" by しぐれうい

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1917 | 粛聖!!ロリ神レクイエム | しぐれうい | 3 |
| song-2660 | 粛聖!!ロリ神レクイエム | しぐれうい (with 浠Mizuki) | 1 |

### A-0481: "約束の絆" (2 entries, 2 perfs)
**Canonical**: "約束の絆" by 妖夢討伐隊

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-998 | 約束の絆 | 妖夢討伐隊 | 1 |
| song-1620 | 約束の絆 | 妖夢討伐隊 | 1 |

### A-0482: "約束をしよう" (3 entries, 3 perfs)
**Canonical**: "約束をしよう" by supercell

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1179 | 約束をしよう | Supercell(ryo) | 1 |
| song-2146 | 約束をしよう | supercell | 1 |
| song-3091 | 約束をしよう | Supercell | 1 |

### A-0483: "純白之誓" (2 entries, 4 perfs)
**Canonical**: "純白之誓" by 浠Mizuki & 夏語遙

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2196 | 純白之誓 | 浠Mizuki & 夏語遙 | 3 |
| song-1017 | 純白之誓 | 浠Mizuki&夏語遙 | 1 |

### A-0484: "結ンデ開イテ羅刹ト骸" (2 entries, 3 perfs)
**Canonical**: "結ンデ開イテ羅刹ト骸" by ハチ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-99 | 結ンデ開イテ羅刹ト骸 | ハチ | 2 |
| song-1003 | 結ンデ開イテ羅刹ト骸 | ハチ | 1 |

### A-0485: "美好事物" (2 entries, 2 perfs)
**Canonical**: "美好事物" by 房東的貓

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1647 | 美好事物 | 房東的貓 | 1 |
| song-1977 | 美好事物 | 房東的貓 | 1 |

### A-0486: "美好的事可不可以發生在我身上" (2 entries, 2 perfs)
**Canonical**: "美好的事可不可以發生在我身上" by 康士坦的變化球

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2403 | 美好的事可不可以發生在我身上 | 康士坦的變化球 (KST) | 1 |
| song-3106 | 美好的事可不可以發生在我身上 | 康士坦的變化球 | 1 |

### A-0487: "群青" (2 entries, 7 perfs)
**Canonical**: "群青" by YOASOBI

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-479 | 群青 | YOASOBI | 6 |
| song-1640 | 群青 | YOASOBI | 1 |

### A-0488: "聖誕結" (2 entries, 4 perfs)
**Canonical**: "聖誕結" by 陳奕迅

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1363 | 聖誕結 | 陳奕迅 | 3 |
| song-1094 | 聖誕結 | 陳奕迅 | 1 |

### A-0489: "能遇見，就很不錯了" (2 entries, 3 perfs)
**Canonical**: "能遇見，就很不錯了" by 菲道爾

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2961 | 能遇見，就很不錯了 | 菲道爾 | 2 |
| song-3052 | 能遇見,就很不錯了 | 菲道爾 | 1 |

### A-0490: "與浪之間" (2 entries, 7 perfs)
**Canonical**: "與浪之間" by Vast & Hazy

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1239 | 與浪之間 | Vast & Hazy | 5 |
| song-428 | 與浪之間 | Vast&Hazy | 2 |

### A-0491: "花" (2 entries, 4 perfs)
**Canonical**: "花" by Hello Nico

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-128 | 花 | Hello Nico | 3 |
| song-2110 | 花 | Hello Nico | 1 |

### A-0492: "莉莉安" (2 entries, 3 perfs)
**Canonical**: "莉莉安" by 宋冬野

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1144 | 莉莉安 | 宋冬野 | 2 |
| song-1889 | 莉莉安 | 宋冬野 | 1 |

### A-0493: "虎視眈々" (2 entries, 2 perfs)
**Canonical**: "虎視眈々" by 梅とら

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-464 | 虎視眈々 | 梅とら様 | 1 |
| song-1392 | 虎視眈々 | 梅とら | 1 |

### A-0494: "虹の彼方に" (2 entries, 6 perfs)
**Canonical**: "虹の彼方に" by ReoNa

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-571 | 虹の彼方に | ReoNa | 5 |
| song-1479 | 虹の彼方に | ReoNa | 1 |

### A-0495: "蜜月アン・ドゥ・トロワ" (2 entries, 2 perfs)
**Canonical**: "蜜月アン・ドゥ・トロワ" by 鏡音リン

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1636 | 蜜月アン・ドゥ・トロワ | 鏡音リン | 1 |
| song-2672 | 蜜月アン・ドゥ・トロワ | 鏡音リン | 1 |

### A-0496: "行走的魚" (2 entries, 6 perfs)
**Canonical**: "行走的魚" by 徐佳瑩

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2133 | 行走的魚 | 徐佳瑩 | 4 |
| song-1894 | 行走的魚 | 徐佳瑩 | 2 |

### A-0497: "言不由衷" (3 entries, 6 perfs)
**Canonical**: "言不由衷" by 徐佳瑩

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-131 | 言不由衷 | 徐佳瑩 | 4 |
| song-1483 | 言不由衷 | 徐佳瑩 | 1 |
| song-950 | 言不由衷 | 徐佳瑩 LaLa | 1 |

### A-0498: "誇り高きアイドル" (5 entries, 5 perfs)
**Canonical**: "誇り高きアイドル" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-156 | 誇り高きアイドル | HoneyWorks feat. mona | 1 |
| song-600 | 誇り高きアイドル | HoneyWorks(feat.KoToha) | 1 |
| song-1616 | 誇り高きアイドル | HoneyWorks | 1 |
| song-1989 | 誇り高きアイドル | HoneyWorks | 1 |
| song-2719 | 誇り高きアイドル | HoneyWorks ft.Kotoha | 1 |

### A-0499: "說到愛" (2 entries, 2 perfs)
**Canonical**: "說到愛" by 蔡健雅

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-827 | 說到愛 | 蔡健雅 Tanya Chua | 1 |
| song-2298 | 說到愛 | 蔡健雅 | 1 |

### A-0500: "誰" (3 entries, 7 perfs)
**Canonical**: "誰" by 李友廷

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1 | 誰 | 李友廷 | 4 |
| song-47 | 誰 | 李友廷 Yo Lee | 2 |
| song-1612 | 誰 | 李友廷 | 1 |

### A-0501: "象牙舟" (3 entries, 6 perfs)
**Canonical**: "象牙舟" by 傻子與白痴

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2021 | 象牙舟 | 傻子與白痴 | 2 |
| song-2121 | 象牙舟 | 傻子與白痴 | 2 |
| song-2236 | 象牙舟 | 傻子與白癡 | 2 |

### A-0502: "貓理不理毛" (2 entries, 3 perfs)
**Canonical**: "貓理不理毛" by 魚乾

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-273 | 貓理不理毛 | 魚乾 | 2 |
| song-1772 | 貓理不理毛 | 魚乾 | 1 |

### A-0503: "負重一萬斤長大" (2 entries, 2 perfs)
**Canonical**: "負重一萬斤長大" by 太一

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-260 | 負重一萬斤長大 | 太一 | 1 |
| song-3073 | 負重一萬斤長大 | 太一 | 1 |

### A-0504: "走建國路回家但後座少ㄌ泥" (2 entries, 2 perfs)
**Canonical**: "走建國路回家但後座少ㄌ泥" by 多多

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1506 | 走建國路回家但後座少ㄌ泥 | 多多 | 1 |
| song-2748 | 走建國路回家但後座少ㄌ泥 | 多多 x 以捷 | 1 |

### A-0505: "路過人間" (2 entries, 6 perfs)
**Canonical**: "路過人間" by 郁可唯

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1812 | 路過人間 | 郁可唯 | 4 |
| song-1471 | 路過人間 | 郁可唯 | 2 |

### A-0506: "踊" (3 entries, 7 perfs)
**Canonical**: "踊" by Ado

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-396 | 踊 | Ado | 5 |
| song-1761 | 踊 | Ado | 1 |
| song-1982 | 踊 | ADO | 1 |

### A-0507: "這條小魚在乎" (2 entries, 2 perfs)
**Canonical**: "這條小魚在乎" by 王ok

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2567 | 這條小魚在乎 | 王OK & 洪佩瑜 | 1 |
| song-3066 | 這條小魚在乎 | 王ok | 1 |

### A-0508: "還是會" (2 entries, 2 perfs)
**Canonical**: "還是會" by 韋禮安

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-944 | 還是會 | 韋禮安 | 1 |
| song-2394 | 還是會 | 韋禮安 | 1 |

### A-0509: "醉後喜歡我" (3 entries, 6 perfs)
**Canonical**: "醉後喜歡我" by icyball 冰球樂團

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1347 | 醉後喜歡我 | icyball 冰球樂團 | 3 |
| song-1064 | 醉後喜歡我 | icyball 冰球樂團 | 2 |
| song-2138 | 醉後喜歡我 | Icyball冰球樂團 | 1 |

### A-0510: "錦鯉抄" (3 entries, 3 perfs)
**Canonical**: "錦鯉抄" by 雲の泣 銀臨

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-160 | 錦鯉抄 | 雲の泣 x 銀臨 | 1 |
| song-1253 | 錦鯉抄 | 雲の泣 銀臨 | 1 |
| song-1309 | 錦鯉抄 | 雲の泣-銀臨 | 1 |

### A-0511: "雨愛" (2 entries, 8 perfs)
**Canonical**: "雨愛" by 楊丞琳

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1322 | 雨愛 | 楊丞琳 | 7 |
| song-1224 | 雨愛 | 楊丞琳 Rainie Yang | 1 |

### A-0512: "雪の華" (3 entries, 7 perfs)
**Canonical**: "雪の華" by 中島美嘉

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1097 | 雪の華 | 中島美嘉 | 5 |
| song-592 | 雪の華 | 中島美嘉 | 1 |
| song-1591 | 雪の華 | 中島美嘉 | 1 |

### A-0513: "霧裡" (2 entries, 5 perfs)
**Canonical**: "霧裡" by 姚六一

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-327 | 霧裡 | 姚六一 | 3 |
| song-1662 | 霧裡 | 姚六一 | 2 |

### A-0514: "霽れを待つ" (2 entries, 4 perfs)
**Canonical**: "霽れを待つ" by Orangestar

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1241 | 霽れを待つ | Orangestar | 3 |
| song-406 | 霽れを待つ | Orangestar feat.初音ミク | 1 |

### A-0515: "青と夏" (2 entries, 3 perfs)
**Canonical**: "青と夏" by Mrs. GREEN APPLE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2258 | 青と夏 | Mrs. GREEN APPLE | 2 |
| song-3021 | 青と夏 | Mrs. GREEN APPLE | 1 |

### A-0516: "青花瓷" (2 entries, 4 perfs)
**Canonical**: "青花瓷" by 周杰倫

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2361 | 青花瓷 | 周杰倫 | 3 |
| song-1979 | 青花瓷 | 周杰倫 Jay Chou | 1 |

### A-0517: "革命デュアリズム" (2 entries, 3 perfs)
**Canonical**: "革命デュアリズム" by 水樹奈々 & T.M.Revolution

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-988 | 革命デュアリズム | 水樹奈々 & T.M.Revolution | 2 |
| song-2900 | 革命デュアリズム | 水樹奈々 & T.M.Revolution | 1 |

### A-0518: "響念" (2 entries, 3 perfs)
**Canonical**: "響念" by 響Hibiki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2563 | 響念 | 響Hibiki | 2 |
| song-2653 | 響念 | 響Hibiki (with 浠Mizuki) | 1 |

### A-0519: "響念 Missing" (3 entries, 3 perfs)
**Canonical**: "響念 Missing" by 響Hibiki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2612 | 響念 Missing | 響Hibiki (with 波 · 路譜) | 1 |
| song-3025 | 響念 Missing | 響Hibiki | 1 |
| song-3092 | 響念 Missing | 響Hibiki | 1 |

### A-0520: "響念Missing" (2 entries, 2 perfs)
**Canonical**: "響念Missing" by 響 Hibiki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-286 | 響念Missing | 響Hibki | 1 |
| song-2777 | 響念Missing | 響 Hibiki | 1 |

### A-0521: "飛雲之下" (2 entries, 2 perfs)
**Canonical**: "飛雲之下" by 林俊傑 & 韓紅

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1887 | 飛雲之下 | 林俊傑 & 韓紅 | 1 |
| song-2905 | 飛雲之下 | 林俊傑 & 韓紅 | 1 |

### A-0522: "香格里拉" (2 entries, 3 perfs)
**Canonical**: "香格里拉" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-533 | 香格里拉 | 魏如萱 | 2 |
| song-1609 | 香格里拉 | 魏如萱 | 1 |

### A-0523: "馬戲團公約" (2 entries, 2 perfs)
**Canonical**: "馬戲團公約" by 棉花糖

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-866 | 馬戲團公約 | 棉花糖 katncandix2 | 1 |
| song-2763 | 馬戲團公約 | 棉花糖 | 1 |

### A-0524: "黃昏市長" (2 entries, 2 perfs)
**Canonical**: "黃昏市長" by 糜先生

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1756 | 黃昏市長 | 糜先生 | 1 |
| song-3065 | 黃昏市長 | 糜先生 | 1 |

### A-0525: "黑暗的巴洛克" (2 entries, 2 perfs)
**Canonical**: "黑暗的巴洛克" by 真珠美人魚

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-409 | 黑暗的巴洛克 | 真珠美人魚 | 1 |
| song-1619 | 黑暗的巴洛克 | 真珠美人魚 | 1 |

### A-0526: "黑暗的巴洛克" (2 entries, 4 perfs)
**Canonical**: "黑暗的巴洛克" by 黑美人姐妹花

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1286 | 黑暗的巴洛克 | 黑美人姐妹花 | 2 |
| song-2449 | 黑暗的巴洛克 | 黑美人姊妹花 | 2 |

---

## Category B: Fuzzy Title Matches (67 groups, 164 songs)

Similar but not identical titles within the same artist.
B1 = punctuation/spacing difference, B2 = possible typo.
**Default: skip** — change to `"accept"` if they are the same song.

### B-0001 [B2] (sim=0.875): "だんだん高くなる" (2 entries, 2 perfs)
**Suggested**: "だんだん高くなる" by 40mP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-617 | だんだん高くなる | 40mP | 1 |
| song-616 | だんだん早くなる | 40mP | 1 |

### B-0002 [B2] (sim=0.957): "The Winner Takes It All" (3 entries, 5 perfs)
**Suggested**: "The Winner Takes It All" by ABBA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-606 | The Winner Takes It All | ABBA | 3 |
| song-2496 | The Winter Takes It All | ABBA | 1 |
| song-154 | The Winner Takes it All | ABBA | 1 |

### B-0003 [B2] (sim=0.8): "カタオモイ" (4 entries, 16 perfs)
**Suggested**: "カタオモイ" by Aimer

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-985 | カタオモイ | Aimer | 8 |
| song-210 | カタオモイ | Aimer | 6 |
| song-1666 | カタオモイ | Aimer | 1 |
| song-2813 | カタオモト | Aimer | 1 |

### B-0004 [B2] (sim=0.944): "If I Ain't Got You" (3 entries, 5 perfs)
**Suggested**: "If I Ain't Got You" by Alicia Keys

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2033 | If I Ain't Got You | Alicia Keys | 3 |
| song-1830 | if i ain't got you | Alicia Keys | 1 |
| song-1811 | If I ain'r got you | Alicia Keys | 1 |

### B-0005 [B2] (sim=0.973): "We Can't Be Friend" (4 entries, 4 perfs)
**Suggested**: "We Can't Be Friend" by Ariana Grande

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2425 | We can't be friends | Ariana Grande | 1 |
| song-2485 | we can't be friends | Ariana Grande | 1 |
| song-2609 | we can’t be friends | Ariana Grande | 1 |
| song-2864 | We Can't Be Friend | Ariana Grande | 1 |

### B-0006 [B2] (sim=0.96): "Winter Things" (2 entries, 3 perfs)
**Suggested**: "Winter Things" by Ariana Grande

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-336 | Winter Things | Ariana Grande | 2 |
| song-2576 | Winter Thing | Ariana Grande | 1 |

### B-0007 [B2] (sim=0.941): "Rather Be" (3 entries, 5 perfs)
**Suggested**: "Rather Be" by Clean Bandit

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-518 | Rather Be | Clean Bandit | 3 |
| song-2125 | Rather B | Clean Bandit | 1 |
| song-442 | Rather Be | Clean Bandit(ft.Jess Glynne) | 1 |

### B-0008 [B2] (sim=0.824): "溯Reverse" (4 entries, 4 perfs)
**Suggested**: "溯Reverse" by CORSAK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1268 | 溯 Reverse | CORSAK | 1 |
| song-2103 | 溯Reverse | CORSAK | 1 |
| song-2860 | 溯Reverse | CORSAK ft. 馬吟吟 | 1 |
| song-1687 | Reverse 溯 | CORSAK | 1 |

### B-0009 [B1] (sim=1.0): "Bling-Bang-Bang-Born" (3 entries, 5 perfs)
**Suggested**: "Bling-Bang-Bang-Born" by Creepy Nuts

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2277 | Bling-Bang-Bang-Born | Creepy Nuts | 3 |
| song-2101 | Bling Bang Bang Born | Creepy Nuts | 1 |
| song-2074 | Bling-Bang-bang-Born | Creepy Nuts | 1 |

### B-0010 [B2] (sim=0.857): "ゴーストルール" (3 entries, 4 perfs)
**Suggested**: "ゴーストルール" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1010 | ゴーストルール | DECO*27 | 2 |
| song-468 | ゴーストルール | DECO*27 | 1 |
| song-801 | ゴスートルール | DECO*27 | 1 |

### B-0011 [B2] (sim=0.8): "ハートアラモード (Heart a la mode)" (2 entries, 2 perfs)
**Suggested**: "ハートアラモード (Heart a la mode)" by DECO*27

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-693 | ハートアラモード (Heart a la mode) | DECO*27 | 1 |
| song-694 | ハートアラモード (Heart a la mode) second round | DECO*27 | 1 |

### B-0012 [B2] (sim=0.857): "你站在雲林 我輸得徹底👆😑👇" (3 entries, 8 perfs)
**Suggested**: "你站在雲林 我輸得徹底👆😑👇" by Diiton

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1292 | 你站在雲林 我輸得徹底👆😑👇 | Diiton | 4 |
| song-238 | 你站在雲林 我輸得徹底 | Diiton | 3 |
| song-1934 | 你站在雲林我輸的徹底 | Diiton | 1 |

### B-0013 [B2] (sim=0.833): "Ex's & Oh's" (2 entries, 3 perfs)
**Suggested**: "Ex's & Oh's" by Elle King

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1711 | Ex's & Oh's | Elle King | 2 |
| song-2462 | Ex's and Oh's | Elle King | 1 |

### B-0014 [B2] (sim=0.875): "可愛くてごめん" (4 entries, 8 perfs)
**Suggested**: "可愛くてごめん" by HoneyWorks

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1456 | 可愛くてごめん | HoneyWorks | 5 |
| song-1988 | 可愛くてごめ ん | HoneyWorks | 1 |
| song-1929 | 可愛いくてごめん | HoneyWorks | 1 |
| song-2573 | 可愛くてごめん | HoneyWorks | 1 |

### B-0015 [B2] (sim=0.889): "Way Back Into Love" (2 entries, 4 perfs)
**Suggested**: "Way Back Into Love" by Hugh Grant & Haley Bennett

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1016 | Way Back Into Love | Hugh Grant & Haley Bennett | 3 |
| song-2831 | Way Back Into Home | Hugh Grant & Haley Bennett | 1 |

### B-0016 [B2] (sim=0.857): "酔いどれ知らず" (2 entries, 4 perfs)
**Suggested**: "酔いどれ知らず" by Kanaria

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1295 | 酔いどれ知らず | Kanaria | 3 |
| song-1228 | 醉いどれ知らず | Kanaria | 1 |

### B-0017 [B1] (sim=1.0): "フクロウ～フクロウが知らせる客が来たと～" (3 entries, 5 perfs)
**Suggested**: "フクロウ～フクロウが知らせる客が来たと～" by KOKIA

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-120 | フクロウ～フクロウが知らせる客が来たと～ | KOKIA | 2 |
| song-1293 | フクロウ ～フクロウが知らせる客が来たと～ | KOKIA | 2 |
| song-1606 | フクロウ～フクロウが知らせる客が来たと～ | KOKIA | 1 |

### B-0018 [B2] (sim=0.917): "Never Enough" (4 entries, 7 perfs)
**Suggested**: "Never Enough" by Loren Allred

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1061 | Never Enough | Loren Allred | 4 |
| song-2877 | Nerve Enough | Loren Allred | 1 |
| song-607 | NEVER ENOUGH | Loren Allred | 1 |
| song-1781 | never enough | Loren Allred | 1 |

### B-0019 [B2] (sim=0.8): "Sugar" (3 entries, 6 perfs)
**Suggested**: "Sugar" by Maroon 5

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-439 | Sugar | Maroon 5 | 4 |
| song-1490 | Suger | Maroon 5 | 1 |
| song-1577 | Sugar | Maroon 5 | 1 |

### B-0020 [B2] (sim=0.97): "Master Of Puppet" (2 entries, 2 perfs)
**Suggested**: "Master Of Puppet" by Metallica

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-3107 | Master Of Puppet | Metallica | 1 |
| song-2772 | Master of Puppets | Metallica | 1 |

### B-0021 [B2] (sim=0.824): "病名は愛だった" (2 entries, 3 perfs)
**Suggested**: "病名は愛だった" by Neru・z'5

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1117 | 病名は愛だった | Neru・z'5 | 2 |
| song-1118 | 0X.病名は愛だった | Neru・z'5 | 1 |

### B-0022 [B2] (sim=0.909): "Hearts" (2 entries, 3 perfs)
**Suggested**: "Hearts" by niki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-680 | Hearts | niki | 2 |
| song-2783 | Heart | niki ft. Lily | 1 |

### B-0023 [B1] (sim=1.0): "Notes'n'Words" (2 entries, 2 perfs)
**Suggested**: "Notes'n'Words" by ONE OK ROCK

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1443 | Notes'n'Words | ONE OK ROCK | 1 |
| song-3064 | Note's 'N' Words | One Ok Rock | 1 |

### B-0024 [B1] (sim=1.0): "Jump Up Super Star!" (3 entries, 3 perfs)
**Suggested**: "Jump Up Super Star!" by Super Mario Odyssey

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1244 | Jump Up, Super Star! | Super Mario Odyssey | 1 |
| song-613 | Jump Up Super Star! | Super Mario Odyssey | 1 |
| song-1575 | Jump Up Super Star! | Super Mario Odyssey | 1 |

### B-0025 [B2] (sim=0.8): "3时12分" (2 entries, 2 perfs)
**Suggested**: "3时12分" by TAKU INOUE-星街すいせい

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1530 | 3时12分 | TAKU INOUE & 星街すいせい | 1 |
| song-1305 | 3時12分 | TAKU INOUE-星街すいせい | 1 |

### B-0026 [B2] (sim=0.971): "champagne problems" (3 entries, 4 perfs)
**Suggested**: "champagne problems" by Taylor Swift

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2182 | champagne problems | Taylor Swift | 2 |
| song-2363 | champagne problem | Taylor Swift | 1 |
| song-3051 | champagne problems | Taylor Swift | 1 |

### B-0027 [B2] (sim=0.833): "未来のひとへ" (2 entries, 5 perfs)
**Suggested**: "未来のひとへ" by TRUE

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-328 | 未来のひとへ | TRUE | 4 |
| song-1702 | 未來のひとへ | TRUE | 1 |

### B-0028 [B1] (sim=1.0): "The Fox(What Does The Fox Say?)" (2 entries, 2 perfs)
**Suggested**: "The Fox(What Does The Fox Say?)" by Ylvis

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-432 | The Fox(What Does The Fox Say?) | Ylvis | 1 |
| song-2000 | The Fox (What Does the Fox Say?) | Ylvis | 1 |

### B-0029 [B1] (sim=1.0): "好きだから。" (2 entries, 7 perfs)
**Suggested**: "好きだから。" by 『ユイカ』

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-778 | 好きだから。 | 『ユイカ』 | 6 |
| song-884 | 好きだから | 『ユイカ』 (with 懶貓子) | 1 |

### B-0030 [B2] (sim=0.889): "生きていたんだよな" (2 entries, 3 perfs)
**Suggested**: "生きていたんだよな" by あいみょん

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-482 | 生きていたんだよな | あいみょん | 2 |
| song-1939 | 生きていたんだよね | あいみょん | 1 |

### B-0031 [B1] (sim=1.0): "チュルリラ·チュルリラ·ダッダッダ！" (2 entries, 2 perfs)
**Suggested**: "チュルリラ·チュルリラ·ダッダッダ！" by くらげP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1953 | チュルリラ·チュルリラ·ダッダッダ！ | くらげP | 1 |
| song-572 | チュルリラ・チュルリラ・ダッダッダ! | くらげP | 1 |

### B-0032 [B1] (sim=1.0): "ほろよい" (2 entries, 2 perfs)
**Suggested**: "ほろよい" by さんひ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1503 | ​ほろよい | さんひ | 1 |
| song-2740 | ほろよい | さんひ | 1 |

### B-0033 [B2] (sim=0.857): "想像フォレスト" (2 entries, 3 perfs)
**Suggested**: "想像フォレスト" by じん

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1567 | 想像フォレスト | じん | 2 |
| song-2330 | 空想フォレスト | じん | 1 |

### B-0034 [B1] (sim=1.0): "rain stops, good-bye" (3 entries, 4 perfs)
**Suggested**: "rain stops, good-bye" by におP

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1990 | rain stops, good-bye | におP | 2 |
| song-2252 | Rain Stops, Goodbye | におP | 1 |
| song-1269 | Rain Stops,Goodbye | におp | 1 |

### B-0035 [B1] (sim=1.0): "命に嫌われている。" (2 entries, 7 perfs)
**Suggested**: "命に嫌われている。" by カンザキイオリ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-98 | 命に嫌われている。 | カンザキイオリ | 5 |
| song-412 | 命に嫌われている | カンザキイオリ | 2 |

### B-0036 [B1] (sim=1.0): "この夜に乾杯" (2 entries, 13 perfs)
**Suggested**: "この夜に乾杯" by メガテラ・ゼロ

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1512 | この夜に乾杯 | メガテラ・ゼロ | 12 |
| song-2139 | この夜に 乾杯 | メガテラ・ゼロ | 1 |

### B-0037 [B2] (sim=0.857): "OAOA(現在就是永遠)" (2 entries, 2 perfs)
**Suggested**: "OAOA(現在就是永遠)" by 五月天Mayday

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-559 | OAOA(現在就是永遠) 日文版 | 五月天Mayday | 1 |
| song-558 | OAOA(現在就是永遠) | 五月天Mayday | 1 |

### B-0038 [B2] (sim=0.8): "死了都要愛" (2 entries, 2 perfs)
**Suggested**: "死了都要愛" by 信樂團

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-424 | 死了都要愛 | 信樂團 | 1 |
| song-1652 | 死了都要爱 | 信樂團 | 1 |

### B-0039 [B2] (sim=0.833): "Gimme×Gimme" (4 entries, 5 perfs)
**Suggested**: "Gimme×Gimme" by 八王子P × Giga

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1587 | Gimme×Gimme | 八王子P × Giga | 2 |
| song-2709 | Gimme x Gimme | 八王子P × Giga(ギガ) feat. 初音ミク・鏡音リ | 1 |
| song-1115 | Gimme×Gimme | 八王子P-Giga | 1 |
| song-2892 | Gimme×Gimme | 八王子P & Giga | 1 |

### B-0040 [B1] (sim=1.0): "你，好不好" (2 entries, 2 perfs)
**Suggested**: "你，好不好" by 周興哲

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2834 | 你，好不好？ | 周興哲 | 1 |
| song-2123 | 你，好不好 | 周興哲 | 1 |

### B-0041 [B1] (sim=1.0): "Butter-Fly" (2 entries, 5 perfs)
**Suggested**: "Butter-Fly" by 和田光司

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-430 | Butter-Fly | 和田光司 | 4 |
| song-2094 | Butter Fly | 和田光司 | 1 |

### B-0042 [B1] (sim=1.0): "きみだけは。" (2 entries, 2 perfs)
**Suggested**: "きみだけは。" by 夏代孝明

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1029 | きみだけは。 | 夏代孝明 | 1 |
| song-542 | きみだけは | 夏代孝明 | 1 |

### B-0043 [B2] (sim=0.818): "クイーンオブハート" (2 entries, 5 perfs)
**Suggested**: "クイーンオブハート" by 奏音69

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-678 | クイーンオブハート | 奏音69 | 4 |
| song-2432 | アンチ・クイーンオブハート | 奏音69 | 1 |

### B-0044 [B1] (sim=1.0): "斑馬斑馬" (3 entries, 4 perfs)
**Suggested**: "斑馬斑馬" by 宋冬野

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-939 | 斑馬斑馬 | 宋冬野 | 2 |
| song-2393 | 斑馬斑馬 | 宋冬野 | 1 |
| song-1688 | 斑馬，斑馬 | 宋冬野 | 1 |

### B-0045 [B1] (sim=1.0): "Ahoy!! 我ら宝鐘海賊団" (2 entries, 4 perfs)
**Suggested**: "Ahoy!! 我ら宝鐘海賊団" by 宝鐘マリン

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-359 | Ahoy!! 我ら宝鐘海賊団 | 宝鐘マリン | 3 |
| song-1486 | Ahoy!!我ら宝鐘海賊団 | 宝鐘マリン | 1 |

### B-0046 [B1] (sim=1.0): "Can I be your baby" (2 entries, 2 perfs)
**Suggested**: "Can I be your baby" by 山東

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-3120 | Can I be your baby | 山東 | 1 |
| song-2489 | Can I be Your Baby? | 山東 | 1 |

### B-0047 [B1] (sim=1.0): "さよならの夏～コクリコ坂から～" (4 entries, 5 perfs)
**Suggested**: "さよならの夏～コクリコ坂から～" by 手嶌葵

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-673 | さよならの夏～コクリコ坂から～ | 手嶌葵 | 2 |
| song-3055 | さよならの夏~コクリコ坂から〜 | 手嶌葵 | 1 |
| song-2029 | さよならの夏〜コクリコ坂から〜 | 手嶌葵 | 1 |
| song-1602 | さよならの夏～コクリコ坂から～ | 手嶌葵 | 1 |

### B-0048 [B2] (sim=0.8): "テルーの唄" (2 entries, 6 perfs)
**Suggested**: "テルーの唄" by 手嶌葵

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-123 | テルーの唄 | 手嶌葵 | 5 |
| song-2977 | テールの唄 | 手嶌葵 | 1 |

### B-0049 [B2] (sim=0.966): "Stellar Stellar" (3 entries, 10 perfs)
**Suggested**: "Stellar Stellar" by 星街すいせい

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-527 | Stellar Stellar | 星街すいせい | 8 |
| song-2308 | Stellar Stella | 星街すいせい | 1 |
| song-1658 | Stellar Stellar | 星街すいせい | 1 |

### B-0050 [B2] (sim=0.909): "いのちの名前" (2 entries, 3 perfs)
**Suggested**: "いのちの名前" by 木村弓

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2071 | いのちの名前 | 木村弓 | 2 |
| song-1938 | いちの名前 | 木村弓 | 1 |

### B-0051 [B2] (sim=0.923): "像天堂的懸崖" (2 entries, 2 perfs)
**Suggested**: "像天堂的懸崖" by 李佳薇

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1420 | 像是天堂的懸崖 | 李佳薇 | 1 |
| song-2679 | 像天堂的懸崖 | 李佳薇 | 1 |

### B-0052 [B2] (sim=0.833): "瑠璃色の地球" (2 entries, 3 perfs)
**Suggested**: "瑠璃色の地球" by 松本隆-平井夏美-松田聖子

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1177 | 瑠璃色の地球 | 松本隆-平井夏美-松田聖子 | 2 |
| song-2225 | 琉璃色の地球 | 松本隆-平井夏美-松田聖子 | 1 |

### B-0053 [B1] (sim=1.0): "Luminous 冬明けのボヤージュ" (2 entries, 2 perfs)
**Suggested**: "Luminous 冬明けのボヤージュ" by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-344 | Luminous - 冬明けのボヤージュ | 浠Mizuki | 1 |
| song-3027 | Luminous 冬明けのボヤージュ | 浠Mizuki | 1 |

### B-0054 [B2] (sim=0.909): "未知未踏アルスハイル Piano ver." (3 entries, 4 perfs)
**Suggested**: "未知未踏アルスハイル Piano ver." by 浠Mizuki

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2026 | 未知未踏アルスハイル Piano ver. | 浠Mizuki | 2 |
| song-1805 | 未知未踏アルスハイル(Piano ver.) | 浠Mizuki | 1 |
| song-303 | 未知未踏アルスハイル (pinao ver.) | 浠Mizuki | 1 |

### B-0055 [B1] (sim=1.0): "漫夜Sleepless" (2 entries, 4 perfs)
**Suggested**: "漫夜Sleepless" by 澪Rei

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2095 | 漫夜Sleepless | 澪Rei | 3 |
| song-2207 | 漫夜 Sleepless | 澪Rei | 1 |

### B-0056 [B1] (sim=1.0): "我多喜歡你你會知道" (2 entries, 2 perfs)
**Suggested**: "我多喜歡你你會知道" by 王俊琪

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2493 | 我多喜歡你你會知道 | 王俊琪 | 1 |
| song-1152 | 我多喜歡你,你會知道 | 王俊琪 | 1 |

### B-0057 [B1] (sim=1.0): "アメヲマツ、" (2 entries, 4 perfs)
**Suggested**: "アメヲマツ、" by 美波

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-443 | アメヲマツ、 | 美波 | 3 |
| song-2044 | アメヲマツ | 美波 | 1 |

### B-0058 [B2] (sim=0.857): "カワキヲアメク" (2 entries, 2 perfs)
**Suggested**: "カワキヲアメク" by 美波

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-164 | カワキヲアメク | 美波 | 1 |
| song-2105 | カワキラアメク | 美波 | 1 |

### B-0059 [B1] (sim=1.0): "我還年輕我還年輕" (2 entries, 2 perfs)
**Suggested**: "我還年輕我還年輕" by 老王樂隊

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-546 | 我還年輕 我還年輕 | 老王樂隊 | 1 |
| song-2636 | 我還年輕我還年輕 | 老王樂隊 (with 半點) | 1 |

### B-0060 [B2] (sim=0.96): "sweets parade" (3 entries, 4 perfs)
**Suggested**: "sweets parade" by 花澤香菜

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1449 | sweets parade | 花澤香菜 | 2 |
| song-145 | SWEET PARADE | 花澤香菜 | 1 |
| song-675 | Sweets Parade | 花澤香菜 | 1 |

### B-0061 [B2] (sim=0.875): "殺死那個石家莊人" (2 entries, 2 perfs)
**Suggested**: "殺死那個石家莊人" by 萬能青年旅店

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2682 | 殺死那個石家莊人 | 萬能青年旅店 | 1 |
| song-2382 | 殺死那個石家庄人 | 萬能青年旅店 | 1 |

### B-0062 [B1] (sim=1.0): "心拍数♯0822" (2 entries, 4 perfs)
**Suggested**: "心拍数♯0822" by 蝶々P

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1573 | 心拍数♯0822 | 蝶々P | 2 |
| song-1927 | 心拍数#0822 | 蝶々P | 2 |

### B-0063 [B1] (sim=1.0): "碎吧，睡吧" (2 entries, 3 perfs)
**Suggested**: "碎吧，睡吧" by 許淨淳

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-1360 | 碎吧，睡吧 | 許淨淳 | 2 |
| song-2221 | 碎吧 睡吧 | 許淨淳 | 1 |

### B-0064 [B2] (sim=0.889): "殘酷な天使のテーゼ" (3 entries, 4 perfs)
**Suggested**: "殘酷な天使のテーゼ" by 高橋洋子

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-703 | 残酷な天使のテーゼ | 高橋洋子 | 2 |
| song-455 | 殘酷な天使のテーゼ | 高橋洋子 | 1 |
| song-880 | 殘酷な天使のテーゼ | 高橋洋子 (with 海唧 ) | 1 |

### B-0065 [B2] (sim=0.875): "OpheliNIA" (2 entries, 4 perfs)
**Suggested**: "OpheliNIA" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-230 | OpheliNIA | 魏如萱 | 3 |
| song-1545 | Ophelia | 魏如萱 | 1 |

### B-0066 [B2] (sim=0.842): "還是要相信愛情啊混蛋們" (2 entries, 2 perfs)
**Suggested**: "還是要相信愛情啊混蛋們" by 魏如萱

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2381 | 還是要相信愛情啊混蛋們 | 魏如萱 | 1 |
| song-2859 | 還是要相信愛情啊 | 魏如萱 | 1 |

### B-0067 [B2] (sim=0.9): "今晚的星星我都摘給你" (2 entries, 5 perfs)
**Suggested**: "今晚的星星我都摘給你" by 龍槍Dragonpike

| Song ID | Current Title | Current Artist | Perfs |
|---------|--------------|----------------|-------|
| song-2299 | 今晚的星星我都摘給你 | 龍槍Dragonpike | 4 |
| song-2746 | 今晚的星星我都打給你 | 龍槍Dragonpike | 1 |

---

## Category C: Same Title, Different Artists (251 groups, informational)

These titles appear with multiple distinct artists (covers, different attributions).
Listed for reference. To standardize any, add groups to `dedup_decisions.json`.

### C-0001: "#超絶かわいい" (2 entries, 2 artist variants)
- **HoneyWorks**: song-2417 (3 perfs)
- **mona（CV：夏川椎菜）**: song-2566 (1 perfs)

### C-0002: "-ERROR" (5 entries, 2 artist variants)
- **niki**: song-296, song-1531, song-2657, song-585 (6 perfs)
- **グリリ**: song-1854 (1 perfs)

### C-0003: "8月31日" (3 entries, 2 artist variants)
- **DECO*27**: song-897, song-2129 (2 perfs)
- **初音ミク**: song-2743 (1 perfs)

### C-0004: "A Million Dreams" (7 entries, 3 artist variants)
- **The Greatest Showman**: song-499, song-1814, song-2710 (3 perfs)
- **Ziv Zaifman**: song-725, song-2373, song-1014 (4 perfs)
- **P!nk & Willow Sage Hart**: song-1494 (1 perfs)

### C-0005: "A Whole New World" (5 entries, 4 artist variants)
- **Mena Massoud,Naomi Scott**: song-446, song-1813 (2 perfs)
- **ZAYN,Zhavia Ward-Clark on Stage**: song-757 (1 perfs)
- **Naomi Scott & Mena Massoud**: song-2054 (3 perfs)
- ****: song-2966 (1 perfs)

### C-0006: "ALGTR(有嗎炒麵)" (2 entries, 2 artist variants)
- **劉柏辛**: song-1327 (1 perfs)
- **Lexie Liu劉柏辛**: song-1364 (1 perfs)

### C-0007: "ALICE" (2 entries, 2 artist variants)
- **古川本鋪**: song-829 (1 perfs)
- **古川本舗**: song-2532 (1 perfs)

### C-0008: "All Alone With You" (2 entries, 2 artist variants)
- **EGOIST**: song-237 (4 perfs)
- **ryo-EGOIST**: song-583 (1 perfs)

### C-0009: "Arrietty's Song" (3 entries, 2 artist variants)
- **Cécile Corbel**: song-830 (1 perfs)
- **セシル・コルベル**: song-2239, song-2526 (2 perfs)

### C-0010: "baby" (2 entries, 2 artist variants)
- **Guiano**: song-3013 (2 perfs)
- **Justin Bieber**: song-3119 (1 perfs)

### C-0011: "bad guy" (3 entries, 2 artist variants)
- **Billie Eilish**: song-638, song-2305 (4 perfs)
- **怪奇比莉**: song-2098 (1 perfs)

### C-0012: "Bang Bang" (6 entries, 2 artist variants)
- **Jessie J-Ariana Grande-Nicki Minaj**: song-614, song-2439, song-2726, song-2039, song-2671 (8 perfs)
- **Ariana Grande**: song-2106 (1 perfs)

### C-0013: "Beauty and the Beast" (2 entries, 2 artist variants)
- **Celine Dion & Peabo Bryson**: song-2695 (1 perfs)
- **Ariana Grande & John Legend**: song-3135 (1 perfs)

### C-0014: "blue" (5 entries, 4 artist variants)
- **LUCKY TAPES**: song-1013 (3 perfs)
- **Elina**: song-1037, song-1414 (5 perfs)
- **Hampus Hjellström & Elina**: song-1137 (1 perfs)
- **Whale Taylor**: song-2267 (1 perfs)

### C-0015: "Calc." (7 entries, 3 artist variants)
- **ジミーサムP**: song-129, song-1671, song-951, song-1236, song-2761 (13 perfs)
- **英：まど＠実写リロ；日：ジミーサムP**: song-2035 (1 perfs)
- **初音ミク**: song-2728 (1 perfs)

### C-0016: "Can You Feel The Love Tonight" (4 entries, 2 artist variants)
- **Elton John**: song-42, song-1738, song-1925 (6 perfs)
- **Sir Elton Hercules John**: song-562 (3 perfs)

### C-0017: "CH4NGE" (4 entries, 3 artist variants)
- **ギガP**: song-259, song-1066 (2 perfs)
- **Giga**: song-795 (3 perfs)
- ****: song-3000 (1 perfs)

### C-0018: "Chicken Attack" (2 entries, 2 artist variants)
- **石井健雄・格雷戈里兄弟**: song-484 (1 perfs)
- **石井健雄**: song-876 (2 perfs)

### C-0019: "City of stars" (3 entries, 2 artist variants)
- **Ryan Gosling & Emma Stone**: song-1903, song-1954 (3 perfs)
- **Emma Stone & Ryan Gosling**: song-2910 (1 perfs)

### C-0020: "Colors of the Wind" (3 entries, 3 artist variants)
- **Vanessa Williams**: song-1725 (1 perfs)
- **Judy Kuhn**: song-2055 (1 perfs)
- ****: song-3072 (1 perfs)

### C-0021: "Dear" (3 entries, 3 artist variants)
- **Mrs. GREEN APPLE**: song-4 (4 perfs)
- **19-iku-**: song-799 (1 perfs)
- **19's Sound Factory**: song-1552 (2 perfs)

### C-0022: "Die With A Smile" (2 entries, 2 artist variants)
- **Lady Gaga & Bruno Mars**: song-2832 (1 perfs)
- **Bruno Mars & Lady Gaga**: song-3131 (1 perfs)

### C-0023: "DREAMER" (2 entries, 2 artist variants)
- **96猫-BOUNCEBACK-ats-**: song-1001 (1 perfs)
- **EIKO starring 96猫**: song-2152 (1 perfs)

### C-0024: "Fall in Love" (6 entries, 2 artist variants)
- **九九 & 陳忻玥**: song-1749, song-2461, song-2641, song-2901 (5 perfs)
- **九九 Sophie Chen x 陳忻玥 Vicky Chen**: song-1969, song-2979 (2 perfs)

### C-0025: "Femme Fatale" (4 entries, 2 artist variants)
- **ヒプノシスマイク**: song-257, song-1914 (2 perfs)
- **中王区**: song-1822, song-2440 (2 perfs)

### C-0026: "flos" (5 entries, 2 artist variants)
- **R Sound Design**: song-399, song-609, song-892, song-1290 (10 perfs)
- **初音ミク**: song-2731 (1 perfs)

### C-0027: "Fly Me To The Moon" (9 entries, 5 artist variants)
- **Bart Howard**: song-947, song-2223, song-2238 (4 perfs)
- **Frank Sinatra**: song-1540, song-2853, song-2972 (3 perfs)
- ****: song-1825 (1 perfs)
- **鍾嘉欣**: song-1877 (1 perfs)
- **Kaye Ballard**: song-1937 (1 perfs)

### C-0028: "For the First Time in Forever" (3 entries, 3 artist variants)
- ****: song-1089 (1 perfs)
- **Willemijn Verkaik**: song-1728 (1 perfs)
- **Kristen Bell & Idina Menzel**: song-2052 (2 perfs)

### C-0029: "Free" (2 entries, 2 artist variants)
- **Rumi & Jinu (Kpop Demon Hunters)**: song-226 (1 perfs)
- **KPop Demon Hunters**: song-3012 (2 perfs)

### C-0030: "Galaxy Anthem" (3 entries, 3 artist variants)
- **Diva (Vo.Kairi Yagi)**: song-18 (1 perfs)
- **Vivy**: song-1847 (2 perfs)
- **ヴィヴィ(八木海莉)**: song-2131 (1 perfs)

### C-0031: "Golden" (3 entries, 2 artist variants)
- **HUNTR/X**: song-38, song-3063 (2 perfs)
- **KPop Demon Hunters**: song-3038 (1 perfs)

### C-0032: "Good Time" (2 entries, 2 artist variants)
- **Owl City & Carly Rae Jepsen**: song-792 (6 perfs)
- **Carly Rae Jepsen & Owl City**: song-2935 (1 perfs)

### C-0033: "Harmony of One's Heart" (3 entries, 3 artist variants)
- **Diva**: song-681 (1 perfs)
- **ヴィヴィ(八木海莉)**: song-2132 (2 perfs)
- **八木海莉**: song-2835 (2 perfs)

### C-0034: "Hearts" (3 entries, 2 artist variants)
- **niki**: song-407, song-680 (3 perfs)
- **Lily**: song-2089 (1 perfs)

### C-0035: "Hero too" (5 entries, 4 artist variants)
- **KYOKA JIRO Starring Chrissy Costanza**: song-169, song-2153 (3 perfs)
- ****: song-1597 (1 perfs)
- **あやぺた-林ゆうき-耳郎響香**: song-1861 (1 perfs)
- **Chrissy Costanza**: song-2364 (1 perfs)

### C-0036: "Honey" (2 entries, 2 artist variants)
- **王心凌**: song-2838 (2 perfs)
- **Taylor Swift**: song-3118 (1 perfs)

### C-0037: "I See The Light" (5 entries, 2 artist variants)
- **魔髮奇緣**: song-445 (1 perfs)
- **Mandy Moore & Zachary Levi**: song-756, song-1589, song-1896, song-2056 (5 perfs)

### C-0038: "I'll Be Home" (2 entries, 2 artist variants)
- ****: song-1101 (1 perfs)
- **Meghan Trainor**: song-1964 (3 perfs)

### C-0039: "I'm still alive today" (6 entries, 4 artist variants)
- **96猫**: song-835, song-2623, song-2652 (5 perfs)
- **96貓**: song-1948 (1 perfs)
- ****: song-2117 (1 perfs)
- **EIKO**: song-2715 (1 perfs)

### C-0040: "In The Stars" (2 entries, 2 artist variants)
- **ONE OK ROCK (feat. Kiiara)**: song-3141 (1 perfs)
- **Benson Boone**: song-3150 (1 perfs)

### C-0041: "Jump Up, Super Star!" (2 entries, 2 artist variants)
- **Super Mario Odyssey**: song-1244 (1 perfs)
- **Kate Davis**: song-2134 (1 perfs)

### C-0042: "Just Be Friends" (6 entries, 4 artist variants)
- **Dixie Flatline**: song-132, song-1843, song-2296 (4 perfs)
- **Luka (Dixie Flatline)**: song-1681 (1 perfs)
- ****: song-2116 (1 perfs)
- **巡音ルカ**: song-2716 (1 perfs)

### C-0043: "Last Christmas" (3 entries, 2 artist variants)
- **Wham!**: song-590, song-1100 (5 perfs)
- **Ariana Grande**: song-2582 (1 perfs)

### C-0044: "Let it go" (4 entries, 2 artist variants)
- **Idina Menzel**: song-235, song-337, song-1090 (4 perfs)
- **Frozen**: song-589 (1 perfs)

### C-0045: "Love Is an Open Door" (4 entries, 2 artist variants)
- **Kristen Bell & Santino Fontana**: song-755, song-2829, song-2911 (3 perfs)
- **Kristen Anderson-Lopez, Robert Lopez**: song-1729 (1 perfs)

### C-0046: "Lydia" (2 entries, 2 artist variants)
- **F.I.R.飛兒樂團**: song-427 (4 perfs)
- **飛兒樂團**: song-547 (1 perfs)

### C-0047: "magnet" (4 entries, 2 artist variants)
- **流星P**: song-112, song-1009, song-2634 (7 perfs)
- **初音ミク・巡音ルカ**: song-2093 (1 perfs)

### C-0048: "Mermaid" (3 entries, 2 artist variants)
- **浦島坂田船**: song-191, song-280 (2 perfs)
- **buzzG**: song-1169 (2 perfs)

### C-0049: "Moon River" (3 entries, 3 artist variants)
- **奧黛麗·赫本**: song-1882 (1 perfs)
- **Audrey Hepburn**: song-2069 (3 perfs)
- **Andy Williams**: song-2229 (1 perfs)

### C-0050: "Mr.シャーデンフロイデ" (3 entries, 2 artist variants)
- **ひとしずく×やま△**: song-233, song-2513 (2 perfs)
- **初音ミク・鏡音リン・鏡音レン・巡音ルカ・KAITO・MEIKO・GUMI・神威がくぽ**: song-274 (1 perfs)

### C-0051: "narrative" (2 entries, 2 artist variants)
- **LiSA-澤野弘之**: song-999 (1 perfs)
- **SawanoHiroyuki[nZk]:LiSA**: song-1697 (1 perfs)

### C-0052: "Once Upon a Dream" (2 entries, 2 artist variants)
- **Sleeping Beauty-Clark on Stage**: song-750 (1 perfs)
- **Lana Del Rey**: song-1730 (1 perfs)

### C-0053: "One Last Kiss" (2 entries, 2 artist variants)
- **宇多田ヒカル**: song-557 (1 perfs)
- **宇多田光**: song-2677 (1 perfs)

### C-0054: "Ophelia" (2 entries, 2 artist variants)
- **魏如萱waa wei**: song-1378 (1 perfs)
- **魏如萱**: song-1545 (1 perfs)

### C-0055: "Over the rainbow" (2 entries, 2 artist variants)
- **Harold Arlen**: song-431 (1 perfs)
- **Judy Garland**: song-2235 (1 perfs)

### C-0056: "Palette" (4 entries, 4 artist variants)
- **ゆよゆっぺ**: song-636 (1 perfs)
- **Yuyoyuppe**: song-1258 (1 perfs)
- **常闇トワ**: song-1300 (4 perfs)
- ****: song-1638 (1 perfs)

### C-0057: "Part of Your World" (5 entries, 4 artist variants)
- **Halle**: song-192 (1 perfs)
- **豊原江理佳**: song-247 (1 perfs)
- **Jodi Benson**: song-447, song-879 (7 perfs)
- **Alan Menken**: song-1724 (1 perfs)

### C-0058: "R-18" (2 entries, 2 artist variants)
- **奏音69 feat.luz**: song-377 (1 perfs)
- **luz**: song-1851 (1 perfs)

### C-0059: "rain stops, good-bye" (4 entries, 3 artist variants)
- **におP**: song-124, song-1990 (3 perfs)
- **96猫**: song-1323 (1 perfs)
- **初音ミク (におP様)**: song-1682 (1 perfs)

### C-0060: "Ready Steady" (2 entries, 2 artist variants)
- **ギガP**: song-2204 (1 perfs)
- **Giga**: song-2416 (1 perfs)

### C-0061: "Reflection" (3 entries, 2 artist variants)
- **Mulan**: song-453 (2 perfs)
- **Christina Aguilera**: song-1475, song-2053 (2 perfs)

### C-0062: "Remember Me" (3 entries, 2 artist variants)
- **Miguel**: song-1362, song-3090 (2 perfs)
- **Gabriella Flores, Libertad García Fonzi, Gael García Bernal**: song-2686 (1 perfs)

### C-0063: "Rewrite The Stars" (5 entries, 3 artist variants)
- **Anne-Marie & James Arthur**: song-37 (2 perfs)
- **Benj Pasek & Justin Paul**: song-677 (3 perfs)
- **Zac Efron & Zendaya**: song-2456, song-2729, song-2971 (5 perfs)

### C-0064: "Rockabye" (2 entries, 2 artist variants)
- **Clean Bandit**: song-1050 (1 perfs)
- **Ina Wroldsen**: song-1997 (1 perfs)

### C-0065: "rose" (2 entries, 2 artist variants)
- **土屋アンナ**: song-1692 (2 perfs)
- **HANA**: song-3041 (1 perfs)

### C-0066: "Santa, Can't You Hear Me" (2 entries, 2 artist variants)
- **Kelly Clarkson & Ariana Grande**: song-1958 (3 perfs)
- **Ariana Grande**: song-2577 (1 perfs)

### C-0067: "Shallow" (6 entries, 2 artist variants)
- **Lady Gaga & Bradley Cooper**: song-52, song-94, song-2629, song-1930, song-2027 (7 perfs)
- **浠、汐**: song-1500 (1 perfs)

### C-0068: "Sincerely" (5 entries, 3 artist variants)
- **TRUE**: song-676, song-2031, song-3177 (6 perfs)
- **唐沢美帆**: song-2724 (1 perfs)
- **唐澤美帆 ft. SLSmusic**: song-2876 (1 perfs)

### C-0069: "Sing My Pleasure" (4 entries, 4 artist variants)
- **ヴィヴィ（Vo.八木海莉）、グレイス（Vo.小玉ひかり）**: song-172 (1 perfs)
- **Vivy**: song-648 (2 perfs)
- **ヴィヴィ(八木海莉)**: song-2130 (1 perfs)
- **八木海莉**: song-2605 (1 perfs)

### C-0070: "SPiCa" (2 entries, 2 artist variants)
- **kentax-とくP**: song-538 (2 perfs)
- **とくP**: song-3152 (1 perfs)

### C-0071: "StarCrew" (3 entries, 2 artist variants)
- **Sou**: song-1909, song-1926 (2 perfs)
- **赤髪**: song-2145 (1 perfs)

### C-0072: "starduster" (3 entries, 2 artist variants)
- **ジミーサムP**: song-1045, song-1759 (2 perfs)
- **初音ミク**: song-2821 (1 perfs)

### C-0073: "StargazeR" (2 entries, 2 artist variants)
- **骨盤P**: song-1908 (1 perfs)
- **焔魔るり**: song-3139 (1 perfs)

### C-0074: "Summertime" (5 entries, 3 artist variants)
- **cinnamons × evening cinema**: song-1233, song-1281, song-2346 (6 perfs)
- **麦吉_Maggie**: song-1655 (1 perfs)
- ****: song-3024 (1 perfs)

### C-0075: "Tell your world" (4 entries, 2 artist variants)
- **kz**: song-108, song-635, song-1932 (5 perfs)
- **Livetune ft. 初音ミク**: song-2836 (1 perfs)

### C-0076: "Think of You" (3 entries, 2 artist variants)
- **オフィーリア(acane_madder)**: song-1452, song-3015 (4 perfs)
- **Vivy**: song-1859 (1 perfs)

### C-0077: "This Love" (2 entries, 2 artist variants)
- **Maroon 5**: song-1015 (2 perfs)
- **アンジェラ・アキ**: song-2955 (1 perfs)

### C-0078: "Try" (2 entries, 2 artist variants)
- **P!nk**: song-813 (2 perfs)
- **Colbie Caillat**: song-1134 (3 perfs)

### C-0079: "U" (6 entries, 3 artist variants)
- **millennium parade-Belle**: song-262, song-266, song-605, song-1242 (5 perfs)
- **Belle**: song-855 (1 perfs)
- **奏音69**: song-962 (2 perfs)

### C-0080: "umbrella" (4 entries, 2 artist variants)
- **Mrs. GREEN APPLE**: song-2243, song-2497, song-2881 (4 perfs)
- **Rihanna**: song-3084 (1 perfs)

### C-0081: "Under the sea" (3 entries, 2 artist variants)
- **Samuel E. Wright**: song-180 (1 perfs)
- **The Little Mermaid**: song-448, song-747 (3 perfs)

### C-0082: "VILLAIN" (2 entries, 2 artist variants)
- **K/DA**: song-1019 (1 perfs)
- **Stella Jang**: song-2319 (1 perfs)

### C-0083: "Violet Snow" (2 entries, 2 artist variants)
- **結城アイラ**: song-1701 (1 perfs)
- **結城愛良**: song-1858 (1 perfs)

### C-0084: "When You Wish Upon a Star" (3 entries, 3 artist variants)
- **Pinocchio**: song-749 (1 perfs)
- ****: song-1613 (1 perfs)
- **Sara Bareilles**: song-1739 (2 perfs)

### C-0085: "You Raise Me Up" (2 entries, 2 artist variants)
- **Secret Garden-Brian Kennedy**: song-838 (1 perfs)
- **Westlife**: song-1569 (1 perfs)

### C-0086: "あったかいんだからぁ♪" (2 entries, 2 artist variants)
- **HoneyWorks**: song-1349 (1 perfs)
- **クマムシ**: song-1835 (2 perfs)

### C-0087: "いけないボーダーライン" (2 entries, 2 artist variants)
- **小森田實-西直紀-Walküre**: song-650 (1 perfs)
- **ワルキューレ**: song-1539 (2 perfs)

### C-0088: "うらたねこ♀" (3 entries, 2 artist variants)
- **うらたぬき×HoneyWorks**: song-231 (2 perfs)
- **HoneyWorks**: song-869, song-1446 (3 perfs)

### C-0089: "おもかげ" (3 entries, 2 artist variants)
- **milet & Aimer & 幾田りら**: song-2420, song-2868 (3 perfs)
- **Aimer & milet & 幾田りら**: song-3089 (1 perfs)

### C-0090: "お気に召すまま" (2 entries, 2 artist variants)
- **初音ミク＆Eve**: song-275 (1 perfs)
- **Eve**: song-397 (4 perfs)

### C-0091: "からくりピエロ" (3 entries, 2 artist variants)
- **40㍍P**: song-221, song-1461 (6 perfs)
- **40mP**: song-492 (4 perfs)

### C-0092: "きみだけは。" (3 entries, 3 artist variants)
- **天月-あまつき-**: song-281 (1 perfs)
- **夏代孝明x天月**: song-914 (1 perfs)
- **夏代孝明**: song-1029 (1 perfs)

### C-0093: "さよならミッドナイト" (2 entries, 2 artist variants)
- **大柴広己**: song-1413 (3 perfs)
- **まじ娘**: song-1933 (1 perfs)

### C-0094: "それがあなたの幸せとしても" (3 entries, 3 artist variants)
- **ヘブンズP**: song-525 (1 perfs)
- **Heavenz**: song-807 (2 perfs)
- **初音ミク**: song-2360 (1 perfs)

### C-0095: "となりのトトロ" (2 entries, 2 artist variants)
- **井上杏美**: song-1255 (1 perfs)
- **となりのトトロ**: song-1966 (1 perfs)

### C-0096: "ねむるまち" (5 entries, 2 artist variants)
- **くじら,yama**: song-524, song-2119, song-1012, song-1584 (6 perfs)
- **yama**: song-779 (1 perfs)

### C-0097: "はなればなれの君へ" (4 entries, 2 artist variants)
- **Belle**: song-426, song-2460, song-898 (6 perfs)
- **中村佳穂**: song-3031 (1 perfs)

### C-0098: "みちしるべ" (2 entries, 2 artist variants)
- **茅原實里**: song-1522 (1 perfs)
- **茅原実里**: song-1931 (2 perfs)

### C-0099: "アイデンティティ" (2 entries, 2 artist variants)
- **Kanaria**: song-973 (2 perfs)
- **初音ミク**: song-2734 (1 perfs)

### C-0100: "アニマル" (2 entries, 2 artist variants)
- **Animal**: song-1104 (1 perfs)
- **DECO*27**: song-1114 (1 perfs)

### C-0101: "アヤノの幸福理論" (7 entries, 4 artist variants)
- **じん**: song-628, song-2224, song-2468, song-2620 (4 perfs)
- **IA**: song-2353 (1 perfs)
- **Jin**: song-2762 (1 perfs)
- ****: song-3180 (1 perfs)

### C-0102: "アンコール" (3 entries, 2 artist variants)
- **YOASOBI**: song-222, song-1592 (7 perfs)
- **宮野真守**: song-1804 (2 perfs)

### C-0103: "ウィアートル" (4 entries, 3 artist variants)
- **rionos**: song-425, song-1477 (4 perfs)
- **riya-rionos**: song-839 (1 perfs)
- **岡野里音**: song-2720 (1 perfs)

### C-0104: "クリームソーダとシャンデリア" (3 entries, 2 artist variants)
- **Henri-mei**: song-926, song-2099 (2 perfs)
- **Henrii & mei feat.ねんね**: song-2927 (1 perfs)

### C-0105: "シャルル" (3 entries, 2 artist variants)
- **flower**: song-269, song-2356 (2 perfs)
- **バルーン**: song-490 (2 perfs)

### C-0106: "シャンティ" (2 entries, 2 artist variants)
- **wotaku**: song-556 (1 perfs)
- **KAITO**: song-2733 (1 perfs)

### C-0107: "スノードーム" (2 entries, 2 artist variants)
- **ユイカ**: song-334 (1 perfs)
- **『ユイカ』**: song-1959 (2 perfs)

### C-0108: "セカイシックに少年少女" (2 entries, 2 artist variants)
- **そらる & まふまふ**: song-1912 (2 perfs)
- **まふまふ**: song-2940 (1 perfs)

### C-0109: "ダーリン" (3 entries, 2 artist variants)
- **Mrs. GREEN APPLE**: song-363, song-1742 (3 perfs)
- **須田景凪**: song-2022 (2 perfs)

### C-0110: "チュルリラ・チュルリラ・ダッダッダ!" (2 entries, 2 artist variants)
- **くらげP**: song-572 (1 perfs)
- **結月ゆかり**: song-2810 (1 perfs)

### C-0111: "デリヘル呼んだら君が来た" (2 entries, 2 artist variants)
- **ナナホシ管弦楽団**: song-1160 (1 perfs)
- **Nanahoshi Orchestra**: song-1246 (1 perfs)

### C-0112: "トリノコシティ" (2 entries, 2 artist variants)
- **40mp**: song-1046 (1 perfs)
- **40㍍P**: song-2018 (1 perfs)

### C-0113: "ドナーソング" (3 entries, 3 artist variants)
- **れるりり&もじゃ様**: song-477 (1 perfs)
- **GUMI**: song-1867 (2 perfs)
- **もじゃ・れるりり**: song-3053 (1 perfs)

### C-0114: "ドレミファロンド" (2 entries, 2 artist variants)
- **40㍍P**: song-220 (1 perfs)
- **40mP**: song-1120 (1 perfs)

### C-0115: "ド屑" (3 entries, 2 artist variants)
- **なきそ**: song-1515, song-2004 (3 perfs)
- **歌愛ユキ**: song-2355 (1 perfs)

### C-0116: "ハレンチ" (2 entries, 2 artist variants)
- **Chanmina**: song-267 (1 perfs)
- **ちゃんみな**: song-2697 (1 perfs)

### C-0117: "ハロ／ハワユ" (3 entries, 2 artist variants)
- **ナノウ**: song-223, song-495 (6 perfs)
- **初音ミク**: song-2747 (1 perfs)

### C-0118: "パート・オブ・ユア・ワールド" (2 entries, 2 artist variants)
- **Jodi Benson**: song-925 (1 perfs)
- **豊原江理佳**: song-1736 (1 perfs)

### C-0119: "ピニャコラーダ" (2 entries, 2 artist variants)
- **Piña Colada**: song-1321 (1 perfs)
- **ねじ式**: song-2448 (1 perfs)

### C-0120: "フォニイ" (4 entries, 2 artist variants)
- **ツミキ**: song-610, song-2619 (8 perfs)
- **phony**: song-1103, song-1649 (2 perfs)

### C-0121: "フタリボシ" (2 entries, 2 artist variants)
- **40mP**: song-1043 (1 perfs)
- **40㍍P (with 穆克蕗)**: song-2632 (1 perfs)

### C-0122: "フラレガイガール" (3 entries, 2 artist variants)
- **さユり**: song-2276 (1 perfs)
- **酸欠少女さユり**: song-2574, song-2874 (2 perfs)

### C-0123: "ベテルギウス" (2 entries, 2 artist variants)
- **優里**: song-420 (8 perfs)
- **Yuuri**: song-2350 (1 perfs)

### C-0124: "ホシアイ" (2 entries, 2 artist variants)
- **GUMI**: song-279 (1 perfs)
- **レフティーモンスターP**: song-539 (2 perfs)

### C-0125: "ホール・ニュー・ワールド" (2 entries, 2 artist variants)
- **中村倫也&木下晴香 (日文)**: song-1733 (1 perfs)
- **Naomi Scott, Mena Massoud (英文版)**: song-1734 (1 perfs)

### C-0126: "ポラリス" (3 entries, 3 artist variants)
- **Aimer**: song-529 (5 perfs)
- **PARED**: song-1899 (1 perfs)
- **鮭P**: song-1910 (1 perfs)

### C-0127: "マル・マル・モリ・モリ!" (2 entries, 2 artist variants)
- **宮下浩司**: song-1213 (1 perfs)
- **薫と友樹、たまにムック。**: song-1987 (1 perfs)

### C-0128: "ミライチズ" (2 entries, 2 artist variants)
- **HoneyWorks**: song-1155 (1 perfs)
- **夜のひと笑い**: song-2024 (2 perfs)

### C-0129: "メルト" (3 entries, 2 artist variants)
- **supercell**: song-1630, song-2962 (2 perfs)
- **ryo**: song-2278 (1 perfs)

### C-0130: "ライラック" (2 entries, 2 artist variants)
- **Mrs. GREEN APPLE**: song-355 (2 perfs)
- **美波**: song-1704 (2 perfs)

### C-0131: "ルカルカナイトフィーバー" (2 entries, 2 artist variants)
- **SAM(samfree)**: song-770 (1 perfs)
- **samfree**: song-2528 (1 perfs)

### C-0132: "レクイエム" (2 entries, 2 artist variants)
- **Kanaria**: song-2003 (3 perfs)
- **星街すいせい**: song-2100 (1 perfs)

### C-0133: "ヴィラン" (3 entries, 2 artist variants)
- **てにをは**: song-883, song-1053 (5 perfs)
- **flower**: song-2820 (1 perfs)

### C-0134: "不識月" (5 entries, 2 artist variants)
- **LunaSafari**: song-912, song-1875, song-2157, song-2438 (4 perfs)
- **赤羽**: song-1324 (1 perfs)

### C-0135: "九九八十一" (2 entries, 2 artist variants)
- **邪叫教主-烏龜Sui**: song-714 (2 perfs)
- **李伊曼**: song-2691 (1 perfs)

### C-0136: "亞特蘭提斯" (2 entries, 2 artist variants)
- **飛兒樂團**: song-193 (2 perfs)
- **F.I.R.飛兒樂團**: song-861 (2 perfs)

### C-0137: "人マニア" (2 entries, 2 artist variants)
- **原口沙輔**: song-2514 (1 perfs)
- **重音テト**: song-2818 (1 perfs)

### C-0138: "人生に拍手喝采を" (3 entries, 2 artist variants)
- **40㍍P**: song-346, song-1767 (7 perfs)
- **40mP**: song-1407 (1 perfs)

### C-0139: "人質" (2 entries, 2 artist variants)
- **A-Mei張惠妹**: song-672 (1 perfs)
- **張惠妹**: song-1683 (3 perfs)

### C-0140: "今晚的星星我都摘給你" (2 entries, 2 artist variants)
- **龍槍**: song-1913 (1 perfs)
- **龍槍Dragonpike**: song-2299 (4 perfs)

### C-0141: "你啊你啊" (3 entries, 2 artist variants)
- **魏如萱**: song-567, song-2970 (9 perfs)
- **浠、ksp**: song-1498 (1 perfs)

### C-0142: "傲嬌" (2 entries, 2 artist variants)
- **aMEI張惠妹-艾怡良-徐佳瑩**: song-1266 (1 perfs)
- **張惠妹**: song-2869 (1 perfs)

### C-0143: "傳奇" (2 entries, 2 artist variants)
- **李健**: song-1276 (2 perfs)
- **王菲**: song-1493 (1 perfs)

### C-0144: "光年之外" (3 entries, 2 artist variants)
- **鄧紫棋**: song-422, song-2384 (3 perfs)
- **G.E.M. 鄧紫棋**: song-913 (1 perfs)

### C-0145: "六兆年と一夜物語" (2 entries, 2 artist variants)
- **Ayasa**: song-207 (1 perfs)
- **kemu**: song-1106 (1 perfs)

### C-0146: "冬のはなし" (2 entries, 2 artist variants)
- **温詞**: song-2531 (2 perfs)
- **センチミリメンタル**: song-2982 (1 perfs)

### C-0147: "刻在我心底的名字" (2 entries, 2 artist variants)
- **盧廣仲**: song-392 (1 perfs)
- **五月天**: song-2272 (1 perfs)

### C-0148: "創聖のアクエリオン" (2 entries, 2 artist variants)
- **AKINO**: song-349 (2 perfs)
- **岩下祐穂-菅野よう子**: song-708 (3 perfs)

### C-0149: "千本桜" (3 entries, 2 artist variants)
- **黒うさP**: song-107, song-163 (5 perfs)
- **初音ミク**: song-2565 (2 perfs)

### C-0150: "吉原ラメント" (2 entries, 2 artist variants)
- **亜沙**: song-96 (3 perfs)
- **重音テト**: song-2822 (1 perfs)

### C-0151: "君の脈で踊りたかった" (3 entries, 2 artist variants)
- **ピコン**: song-1993, song-2856 (3 perfs)
- **初音ミク**: song-2354 (1 perfs)

### C-0152: "命に嫌われている。" (2 entries, 2 artist variants)
- **カンザキイオリ**: song-98 (5 perfs)
- **初音ミク**: song-2351 (1 perfs)

### C-0153: "喜歡你" (3 entries, 2 artist variants)
- **陳潔儀 Kit Chan**: song-229, song-1278 (4 perfs)
- **徐佳瑩**: song-1325 (1 perfs)

### C-0154: "因為愛情" (3 entries, 2 artist variants)
- **陳奕迅 & 王菲**: song-2370, song-2969 (3 perfs)
- **王菲 & 陳奕迅**: song-2937 (1 perfs)

### C-0155: "在加納共和國離婚" (5 entries, 3 artist variants)
- **菲道爾 & 大穎**: song-2284 (4 perfs)
- **大穎 & 菲道爾**: song-2825, song-2912, song-3129 (3 perfs)
- **菲道尔 & 大颖**: song-2980 (1 perfs)

### C-0156: "地球をあげる" (3 entries, 2 artist variants)
- **はるまきごはん-LUMi**: song-595, song-2625 (2 perfs)
- **LUMi**: song-2823 (1 perfs)

### C-0157: "境界の彼方" (2 entries, 2 artist variants)
- **畑亞貴-菊田大介**: song-1135 (1 perfs)
- **茅原實里**: song-2689 (2 perfs)

### C-0158: "変わらないもの" (2 entries, 2 artist variants)
- **奧華子**: song-834 (2 perfs)
- **奥華子**: song-2070 (1 perfs)

### C-0159: "夜が明ける" (2 entries, 2 artist variants)
- **温詞**: song-347 (1 perfs)
- **ギヴン**: song-3105 (1 perfs)

### C-0160: "夜もすがら君想ふ" (4 entries, 2 artist variants)
- **西沢さんP**: song-785, song-987, song-1634 (4 perfs)
- **TOKOTOKO(西沢さんP)**: song-1136 (1 perfs)

### C-0161: "夜夜夜夜" (2 entries, 2 artist variants)
- **梁靜茹**: song-299 (1 perfs)
- **齊秦**: song-2144 (1 perfs)

### C-0162: "夜明けと蛍" (3 entries, 3 artist variants)
- **ナブナ**: song-909 (9 perfs)
- **初音ミク (ヨルシカ)**: song-1680 (1 perfs)
- ****: song-3176 (1 perfs)

### C-0163: "天ノ弱" (3 entries, 2 artist variants)
- **164**: song-88, song-1572 (7 perfs)
- **GUMI**: song-2352 (2 perfs)

### C-0164: "天樂" (2 entries, 2 artist variants)
- **ゆうゆ**: song-803 (2 perfs)
- **鏡音リン**: song-2090 (1 perfs)

### C-0165: "太陽" (3 entries, 2 artist variants)
- **邱振哲PikA**: song-1225 (1 perfs)
- **邱振哲**: song-1611, song-2569 (2 perfs)

### C-0166: "失落沙洲" (3 entries, 2 artist variants)
- **徐佳瑩**: song-298, song-2388 (2 perfs)
- **徐佳瑩LaLa**: song-940 (1 perfs)

### C-0167: "好きだから" (2 entries, 2 artist variants)
- **ユイカ**: song-137 (2 perfs)
- **『ユイカ』 (with 懶貓子)**: song-884 (1 perfs)

### C-0168: "如果雨之後" (2 entries, 2 artist variants)
- **周興哲Eric**: song-563 (1 perfs)
- **周興哲**: song-1492 (2 perfs)

### C-0169: "如此" (3 entries, 3 artist variants)
- **何佳樂**: song-1259 (2 perfs)
- **單依純**: song-1564 (1 perfs)
- ****: song-2118 (3 perfs)

### C-0170: "威風堂々" (2 entries, 2 artist variants)
- **梅とら**: song-118 (5 perfs)
- **巡音ルカ & 初音ミク & GUMI & IA & 鏡音リン**: song-2784 (1 perfs)

### C-0171: "小丑的品格" (3 entries, 2 artist variants)
- **泠鳶yousa**: song-1312, song-2158 (2 perfs)
- **三無＆ 雙笙**: song-2819 (1 perfs)

### C-0172: "崖の上のポニョ" (2 entries, 2 artist variants)
- **久石譲**: song-1173 (1 perfs)
- **大橋望美-藤岡藤卷**: song-1256 (1 perfs)

### C-0173: "幸せ。" (3 entries, 2 artist variants)
- **CHiCO with HoneyWorks**: song-55, song-1467 (3 perfs)
- **HoneyWorks**: song-851 (2 perfs)

### C-0174: "強風オールバック" (2 entries, 2 artist variants)
- **Yukopi**: song-1707 (4 perfs)
- **ゆこぴ**: song-2742 (1 perfs)

### C-0175: "從前慢" (2 entries, 2 artist variants)
- **葉炫清**: song-945 (5 perfs)
- **劉胡軼**: song-1416 (1 perfs)

### C-0176: "忘れじの言の葉" (4 entries, 2 artist variants)
- **未来古代楽団 ft. 安次嶺希和子**: song-307, song-1637, song-2358 (3 perfs)
- **安次嶺希和子**: song-1866 (3 perfs)

### C-0177: "思念是一種病" (2 entries, 2 artist variants)
- **張震嶽 A-Yue**: song-928 (1 perfs)
- **張震嶽 & 蔡健雅**: song-2933 (1 perfs)

### C-0178: "恋愛裁判" (2 entries, 2 artist variants)
- **浠、ksp**: song-1496 (1 perfs)
- **40㍍P**: song-2197 (2 perfs)

### C-0179: "愛你" (3 entries, 3 artist variants)
- **陳芳語**: song-139 (3 perfs)
- **王心凌**: song-504 (2 perfs)
- **Kimberley陳芳語**: song-927 (1 perfs)

### C-0180: "愛唄" (2 entries, 2 artist variants)
- **GReeeeN**: song-1157 (3 perfs)
- **GRe4N BOYZ**: song-3103 (1 perfs)

### C-0181: "我多麼想成為你的鹿" (2 entries, 2 artist variants)
- **Frandé**: song-872 (2 perfs)
- **南瓜妮歌迷俱樂部**: song-1209 (2 perfs)

### C-0182: "我想你要走了" (3 entries, 2 artist variants)
- **張懸**: song-1316, song-2120 (2 perfs)
- **安溥**: song-3112 (1 perfs)

### C-0183: "我把我的青春給你" (2 entries, 2 artist variants)
- **好樂團GoodBand**: song-549 (1 perfs)
- **好樂團**: song-1941 (3 perfs)

### C-0184: "所念皆星河" (3 entries, 2 artist variants)
- **房東的貓**: song-306, song-1659 (11 perfs)
- **房东的猫**: song-1546 (1 perfs)

### C-0185: "掉了" (2 entries, 2 artist variants)
- **A-MIT**: song-943 (1 perfs)
- **張惠妹**: song-2217 (2 perfs)

### C-0186: "新宝島" (2 entries, 2 artist variants)
- **サカナクション**: song-1077 (2 perfs)
- **魚韻**: song-2781 (1 perfs)

### C-0187: "旦那様とのラブラブ・ラブソング" (2 entries, 2 artist variants)
- **釘宮理惠**: song-316 (3 perfs)
- **釘宮理恵**: song-354 (1 perfs)

### C-0188: "易燃易爆炸" (2 entries, 2 artist variants)
- **尚夢迪-駢然**: song-1191 (1 perfs)
- **陳粒**: song-3058 (1 perfs)

### C-0189: "星空" (2 entries, 2 artist variants)
- **五月天Mayday**: song-908 (1 perfs)
- **五月天**: song-2561 (1 perfs)

### C-0190: "晚安歌" (3 entries, 2 artist variants)
- **陳嘉樺Ella**: song-570 (1 perfs)
- **陳嘉樺**: song-1432, song-1614 (3 perfs)

### C-0191: "未完成START" (2 entries, 2 artist variants)
- **Uniparity-EAjRock**: song-1129 (1 perfs)
- **薛南**: song-1915 (1 perfs)

### C-0192: "未来のひとへ" (3 entries, 3 artist variants)
- **TRUE**: song-328 (4 perfs)
- ****: song-1595 (1 perfs)
- **唐澤美帆**: song-2744 (1 perfs)

### C-0193: "桃源恋歌" (2 entries, 2 artist variants)
- **みうめ-メイリア**: song-574 (2 perfs)
- **GARNiDELiA**: song-2985 (1 perfs)

### C-0194: "極光的風" (3 entries, 2 artist variants)
- **香蓮**: song-706, song-2201 (2 perfs)
- ****: song-1618 (1 perfs)

### C-0195: "極楽浄土" (2 entries, 2 artist variants)
- **メイリア(MARiA)-toku**: song-110 (4 perfs)
- **GARNiDELiA**: song-1396 (1 perfs)

### C-0196: "樂園遊夢記" (2 entries, 2 artist variants)
- **小N**: song-291 (1 perfs)
- **耀嘉音**: song-2741 (2 perfs)

### C-0197: "歌よ" (2 entries, 2 artist variants)
- **Belle/中村佳穂**: song-434 (1 perfs)
- **Belle**: song-470 (2 perfs)

### C-0198: "死ぬとき死ねばいい" (2 entries, 2 artist variants)
- **カンザキイオリ**: song-1196 (2 perfs)
- **鏡音レン・リン**: song-2102 (1 perfs)

### C-0199: "母系社會" (4 entries, 3 artist variants)
- **A-MIT**: song-384, song-934 (2 perfs)
- **阿密特**: song-2375 (1 perfs)
- **張惠妹**: song-3109 (1 perfs)

### C-0200: "気分上々↑↑" (2 entries, 2 artist variants)
- **mihimaru GT**: song-771 (4 perfs)
- **大和美姬丸**: song-2708 (1 perfs)

### C-0201: "永遠の不在証明" (2 entries, 2 artist variants)
- **東京事変**: song-647 (1 perfs)
- **椎名林檎**: song-698 (1 perfs)

### C-0202: "沒有理想的人不傷心" (2 entries, 2 artist variants)
- **新褲子**: song-2606 (1 perfs)
- **新褲子樂隊**: song-2827 (1 perfs)

### C-0203: "洋蔥" (2 entries, 2 artist variants)
- **叮噹**: song-225 (1 perfs)
- **Della丁噹**: song-1074 (1 perfs)

### C-0204: "浪人琵琶" (2 entries, 2 artist variants)
- **單色凌，胡66**: song-143 (2 perfs)
- **胡66**: song-1980 (3 perfs)

### C-0205: "涙そうそう" (2 entries, 2 artist variants)
- **夏川里美**: song-1071 (2 perfs)
- **夏川りみ**: song-3018 (1 perfs)

### C-0206: "漂浮群島" (2 entries, 2 artist variants)
- **R1SE張顏齊-李偉菘-易家揚**: song-1214 (1 perfs)
- **孫燕姿**: song-1818 (1 perfs)

### C-0207: "濕了分寸" (3 entries, 2 artist variants)
- **謝震廷 Eli Hsieh**: song-521, song-1722 (5 perfs)
- **谢震廷**: song-2271 (1 perfs)

### C-0208: "牽絲戲" (3 entries, 3 artist variants)
- **Vagary-銀臨**: song-710 (1 perfs)
- **Aki阿杰-銀臨**: song-1301 (1 perfs)
- **銀臨 & Aki阿杰**: song-2882 (1 perfs)

### C-0209: "瑠璃色の地球" (2 entries, 2 artist variants)
- **松本隆-平井夏美-松田聖子**: song-1177 (2 perfs)
- **松田聖子**: song-2030 (5 perfs)

### C-0210: "番凩" (3 entries, 2 artist variants)
- **MEIKO・KAITO**: song-859, song-982 (2 perfs)
- **仕事してP**: song-2931 (1 perfs)

### C-0211: "畫地為牢" (5 entries, 3 artist variants)
- **錦衣小盆友**: song-718 (1 perfs)
- **云の泣 & 葉里**: song-1282, song-1311, song-2903 (5 perfs)
- ****: song-1600 (1 perfs)

### C-0212: "病名は愛だった" (4 entries, 3 artist variants)
- **Neru・z'5**: song-1117, song-2916 (3 perfs)
- ****: song-1765 (1 perfs)
- **鏡音リン・レン**: song-2607 (1 perfs)

### C-0213: "癢" (3 entries, 3 artist variants)
- **孟楠**: song-79 (2 perfs)
- **黃齡**: song-1379 (1 perfs)
- ****: song-3022 (1 perfs)

### C-0214: "百年の恋" (2 entries, 2 artist variants)
- **れるりり**: song-1183 (2 perfs)
- **初音ミク**: song-2097 (2 perfs)

### C-0215: "碼頭姑娘" (3 entries, 2 artist variants)
- **劉芷融**: song-391, song-783 (3 perfs)
- **碼頭姑娘**: song-1412 (1 perfs)

### C-0216: "神のまにまに" (4 entries, 2 artist variants)
- **れるりり**: song-863, song-2635 (4 perfs)
- **れるりりfeat.ミク&リン&GUMI**: song-1657, song-2673 (2 perfs)

### C-0217: "禮拜天情人" (2 entries, 2 artist variants)
- **Mary See the Future**: song-1510 (1 perfs)
- **先知瑪莉**: song-2808 (1 perfs)

### C-0218: "私奔到月球" (2 entries, 2 artist variants)
- **五月天MAYDAY feat. 陳綺貞**: song-161 (1 perfs)
- **五月天 & 陳綺貞**: song-2918 (1 perfs)

### C-0219: "突然好想你" (2 entries, 2 artist variants)
- **Mayday五月天**: song-1072 (1 perfs)
- **五月天**: song-3017 (1 perfs)

### C-0220: "簪花人間" (2 entries, 2 artist variants)
- **忘川風華錄**: song-724 (2 perfs)
- **星塵**: song-1978 (1 perfs)

### C-0221: "紅昭願" (2 entries, 2 artist variants)
- **王梓鈺 & 音闕詩聽**: song-276 (1 perfs)
- **音闕詩聽**: song-711 (1 perfs)

### C-0222: "紅蓮の弓矢" (2 entries, 2 artist variants)
- **Linked Horizon**: song-173 (2 perfs)
- **Revo**: song-923 (1 perfs)

### C-0223: "純白" (3 entries, 3 artist variants)
- **代岳東-V.K克**: song-632 (3 perfs)
- **V.K克**: song-2755 (1 perfs)
- **雙笙**: song-3050 (1 perfs)

### C-0224: "絶え間なく藍色" (2 entries, 2 artist variants)
- **獅子志司**: song-627 (3 perfs)
- **初音ミク**: song-2092 (1 perfs)

### C-0225: "聽見下雨的聲音" (3 entries, 3 artist variants)
- **周杰倫Jay Chou-方文山**: song-828 (1 perfs)
- **周杰倫**: song-2034 (2 perfs)
- **魏如昀**: song-3046 (1 perfs)

### C-0226: "致姍姍來遲的你" (2 entries, 2 artist variants)
- **阿肆 & 林宥嘉**: song-2302 (2 perfs)
- **林宥嘉 & 阿肆**: song-2902 (1 perfs)

### C-0227: "血腥愛情故事" (2 entries, 2 artist variants)
- **張惠妹**: song-100 (3 perfs)
- **A-MIT**: song-933 (1 perfs)

### C-0228: "解藥" (2 entries, 2 artist variants)
- **孟慧圓**: song-1302 (3 perfs)
- **陳奕迅**: song-2768 (1 perfs)

### C-0229: "記得" (2 entries, 2 artist variants)
- **aMEI張惠妹**: song-1315 (1 perfs)
- **張惠妹**: song-2362 (1 perfs)

### C-0230: "起風了" (2 entries, 2 artist variants)
- **吳青峰**: song-809 (1 perfs)
- **買辣椒也用券**: song-2202 (1 perfs)

### C-0231: "身後" (2 entries, 2 artist variants)
- **A-Mei張惠妹**: song-671 (1 perfs)
- **張惠妹**: song-2816 (1 perfs)

### C-0232: "輝く未来" (2 entries, 2 artist variants)
- **畠中洋、小此木麻里**: song-1732 (1 perfs)
- **Mari Okonogi & Hiroshi Hatanaka**: song-2455 (1 perfs)

### C-0233: "追光者" (2 entries, 2 artist variants)
- **唐恬-馬敬-岑寧兒**: song-1180 (1 perfs)
- **岑寧兒**: song-2142 (3 perfs)

### C-0234: "逆光" (2 entries, 2 artist variants)
- **Ado**: song-994 (2 perfs)
- **孫燕姿**: song-1294 (2 perfs)

### C-0235: "透明な心臓が泣いていた" (2 entries, 2 artist variants)
- **堀江晶太-甲斐田晴**: song-1487 (1 perfs)
- **甲斐田晴**: song-1936 (3 perfs)

### C-0236: "連名帶姓" (2 entries, 2 artist variants)
- **張惠妹**: song-383 (4 perfs)
- **aMEI張惠妹**: song-1314 (1 perfs)

### C-0237: "遇見" (2 entries, 2 artist variants)
- **孫燕姿Sun Yan/Zi**: song-601 (1 perfs)
- **孫燕姿**: song-819 (2 perfs)

### C-0238: "運命の人" (2 entries, 2 artist variants)
- **『ユイカ』**: song-2013 (2 perfs)
- **ユイカ**: song-2220 (4 perfs)

### C-0239: "還是要相信愛情啊混蛋們" (2 entries, 2 artist variants)
- **魏如萱waa wei**: song-1377 (1 perfs)
- **魏如萱**: song-2381 (1 perfs)

### C-0240: "酩酊" (2 entries, 2 artist variants)
- **金子このみ**: song-321 (1 perfs)
- **佐々木李子**: song-1718 (4 perfs)

### C-0241: "野子" (2 entries, 2 artist variants)
- **蘇運瑩**: song-622 (2 perfs)
- **田馥甄 & 蘇運瑩**: song-1981 (1 perfs)

### C-0242: "金曜日のおはよう" (2 entries, 2 artist variants)
- **HoneyWorks**: song-1145 (2 perfs)
- **天月**: song-2037 (1 perfs)

### C-0243: "錦鯉抄" (6 entries, 4 artist variants)
- **雲の泣 銀臨**: song-160, song-1253, song-1309 (3 perfs)
- **浠、ksp**: song-1497 (1 perfs)
- **銀臨 & 云之泣**: song-1947 (1 perfs)
- **銀臨 & 雲の泣**: song-2883 (1 perfs)

### C-0244: "離人" (2 entries, 2 artist variants)
- **張學友**: song-1250 (3 perfs)
- **林志炫**: song-2680 (1 perfs)

### C-0245: "雪だるまつくろう" (2 entries, 2 artist variants)
- **From"Frozen"**: song-449 (1 perfs)
- **Sayaka Kanda,Natsuki Inaba, Sumire Morohoshi**: song-754 (1 perfs)

### C-0246: "青花瓷" (3 entries, 2 artist variants)
- **Jay Chou周杰倫**: song-523 (1 perfs)
- **周杰倫**: song-1979, song-2361 (4 perfs)

### C-0247: "非・現実逃避" (3 entries, 3 artist variants)
- **LowFat-おん湯**: song-93 (3 perfs)
- **FantasticYouth × Rabpit × 浠Mizuki**: song-2397 (1 perfs)
- **おん湯×LowFat**: song-2444 (1 perfs)

### C-0248: "風になる" (2 entries, 2 artist variants)
- **つじあやの**: song-421 (1 perfs)
- **辻亞彌乃**: song-1257 (1 perfs)

### C-0249: "魚" (4 entries, 4 artist variants)
- **陳綺貞**: song-194 (1 perfs)
- **怕胖團**: song-197 (3 perfs)
- **怕胖團PAPUN BAND**: song-1654 (1 perfs)
- **西瓜JUN**: song-2764 (1 perfs)

### C-0250: "黑暗的巴洛克" (4 entries, 2 artist variants)
- **真珠美人魚**: song-409, song-1619 (2 perfs)
- **黑美人姐妹花**: song-1286, song-2449 (4 perfs)

### C-0251: "黒い涙" (2 entries, 2 artist variants)
- **土屋アンナ**: song-2237 (1 perfs)
- **土屋安娜**: song-2760 (1 perfs)
