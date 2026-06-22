$dir = "c:\Users\nicho\OneDrive\Documents\Web Development\Aroid Atlas AG\AroidAtlas\Finished Plates"

$renames = @(
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_08 PM (1).png"; To = "Anthurium luxurians.png" },
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_08 PM (2).png"; To = "Anthurium rugulosum.png" },
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_08 PM (3).png"; To = "Anthurium metallicum.png" },
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_08 PM (4).png"; To = "Anthurium peltigerum.png" },
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_08 PM (5).png"; To = "Anthurium splendidum.png" },
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_08 PM (6).png"; To = "Anthurium besseae.png" },
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_08 PM (7).png"; To = "Anthurium carlablackiae.png" },
    @{ From = "ChatGPT Image Jun 20, 2026, 11_09_09 PM (8).png"; To = "Anthurium villenaorum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_22 PM (1).png"; To = "Philodendron tortum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_22 PM (2).png"; To = "Monstera pinnatipartita.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_22 PM (3).png"; To = "Anthurium faustomirandae.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_22 PM (4).png"; To = "Alocasia longiloba.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_22 PM (5).png"; To = "Rhaphidophora beccarii.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_44 PM (1).png"; To = "Philodendron pastazanum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_44 PM (2).png"; To = "Monstera lechleriana.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_44 PM (3).png"; To = "Anthurium crystallinum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_44 PM (4).png"; To = "Alocasia cuprea.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_09_44 PM (5).png"; To = "Rhaphidophora cryptantha.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_40 PM (1).png"; To = "Begonia melanobullata.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_40 PM (3).png"; To = "Begonia sizemoreae.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_40 PM (4).png"; To = "Begonia bipinnatifida.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_40 PM (5).png"; To = "Begonia ningmingensis.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_49 PM (1).png"; To = "Begonia darthvaderiana.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_49 PM (2).png"; To = "Begonia amphioxus.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_49 PM (3).png"; To = "Begonia chlorosticta.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_49 PM (4).png"; To = "Begonia rajah.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_49 PM (5).png"; To = "Begonia soli-mutata.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_57 PM (1).png"; To = "Begonia maculata 'Albo Variegata'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_57 PM (2).png"; To = "Begonia masoniana 'Variegata'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_57 PM (3).png"; To = "Begonia rex-cultorum 'Escargot'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_57 PM (4).png"; To = "Begonia ferox.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_43_57 PM (5).png"; To = "Begonia pavonina.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_39 PM (1).png"; To = "Begonia brevirimosa.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_39 PM (2).png"; To = "Begonia luxurians.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_40 PM (3).png"; To = "Begonia listada.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_40 PM (4).png"; To = "Begonia venosa.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_40 PM (5).png"; To = "Begonia bogneri.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_48 PM (1).png"; To = "Begonia aconitifolia 'Variegata'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_49 PM (2).png"; To = "Begonia malachosticta.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_49 PM (3).png"; To = "Begonia serratipetala.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_49 PM (4).png"; To = "Begonia dregei.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 02_44_49 PM (5).png"; To = "Begonia acetosa.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_33 PM (1).png"; To = "Anthurium luxurians x radicans.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_34 PM (2).png"; To = "Anthurium magnificum x crystallinum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_34 PM (3).png"; To = "Anthurium forgetii x crystallinum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_35 PM (4).png"; To = "Anthurium papillilaminum x magnificum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_35 PM (5).png"; To = "Anthurium luxurians x forgetii.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_46 PM (1).png"; To = "Philodendron billietiae.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_46 PM (2).png"; To = "Philodendron joepii.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_46 PM (3).png"; To = "Philodendron atabapoense.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_46 PM (4).png"; To = "Philodendron rugosum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 03_31_46 PM (5).png"; To = "Philodendron sodiroi.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 10_18_37 AM (1).png"; To = "Monstera deliciosa.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 10_18_37 AM (2).png"; To = "Monstera adansonii.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 10_18_38 AM (3).png"; To = "Philodendron hederaceum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 10_18_38 AM (4).png"; To = "Scindapsus pictus.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 10_18_38 AM (5).png"; To = "Alocasia zebrina.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_14_38 AM (1).png"; To = "Philodendron verrucosum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_14_38 AM (2).png"; To = "Monstera subpinnata.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_14_39 AM (3).png"; To = "Anthurium pedatoradiatum.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_14_39 AM (4).png"; To = "Alocasia lauterbachiana.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_14_39 AM (5).png"; To = "Rhaphidophora hayi.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_23_07 AM (1).png"; To = "Philodendron 'Splendid'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_23_07 AM (2).png"; To = "Philodendron 'Majestic'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_23_07 AM (3).png"; To = "Philodendron 'Dean McDowell'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_23_08 AM (4).png"; To = "Anthurium 'Ace of Spades'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 11_23_08 AM (5).png"; To = "Alocasia 'Sarian'.png" },
    @{ From = "ChatGPT Image Jun 21, 2026, 12_24_59 PM.png";     To = "Monstera deliciosa 'Albo Variegata'.png" }
)

$success = 0
$skipped = 0
$errors  = 0

foreach ($r in $renames) {
    $src  = Join-Path $dir $r.From
    $dest = Join-Path $dir $r.To

    if (-not (Test-Path $src)) {
        Write-Host "MISSING : $($r.From)" -ForegroundColor Yellow
        $skipped++
        continue
    }
    if (Test-Path $dest) {
        Write-Host "EXISTS  : $($r.To) — skipping" -ForegroundColor Cyan
        $skipped++
        continue
    }

    try {
        Rename-Item -LiteralPath $src -NewName $r.To -ErrorAction Stop
        Write-Host "OK      : $($r.From) -> $($r.To)" -ForegroundColor Green
        $success++
    } catch {
        Write-Host "ERROR   : $($r.From) — $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "Done. Renamed: $success  Skipped: $skipped  Errors: $errors"
