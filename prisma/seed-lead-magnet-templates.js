"use strict";
/**
 * Lead Magnet Template Seeding Script
 * Populates the LeadMagnetTemplate table with starter templates
 *
 * Run with: npx tsx prisma/seed-lead-magnet-templates.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var templates, _i, templates_1, template, created, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting lead magnet template seeding...');
                    templates = [
                        {
                            name: 'Professional Ebook Template',
                            description: 'A clean, professional ebook template perfect for guides, reports, and long-form content. Includes cover page, table of contents, and multiple content sections.',
                            category: client_1.TemplateCategory.EBOOK,
                            type: client_1.MagnetType.EBOOK,
                            thumbnailUrl: '/templates/ebook-thumb.jpg',
                            previewUrl: '/templates/ebook-preview.pdf',
                            templateUrl: '/templates/ebook-template.pdf',
                            featured: true,
                            useCount: 0,
                            samplePrompt: 'Create a comprehensive ebook about [topic] with 10-15 pages covering key concepts, actionable tips, and real-world examples.'
                        },
                        {
                            name: 'Ultimate Checklist Template',
                            description: 'A simple, scannable checklist template ideal for step-by-step processes, task lists, and quick reference guides.',
                            category: client_1.TemplateCategory.CHECKLIST,
                            type: client_1.MagnetType.CHECKLIST,
                            thumbnailUrl: '/templates/checklist-thumb.jpg',
                            previewUrl: '/templates/checklist-preview.pdf',
                            templateUrl: '/templates/checklist-template.pdf',
                            featured: true,
                            useCount: 0,
                            samplePrompt: 'Create a checklist for [topic] with 10-20 actionable items organized into logical sections with checkboxes.'
                        },
                        {
                            name: 'Quick Start Guide Template',
                            description: 'A beginner-friendly guide template for tutorials, onboarding materials, and how-to content. Perfect for breaking down complex topics.',
                            category: client_1.TemplateCategory.GUIDE,
                            type: client_1.MagnetType.PDF,
                            thumbnailUrl: '/templates/guide-thumb.jpg',
                            previewUrl: '/templates/guide-preview.pdf',
                            templateUrl: '/templates/guide-template.pdf',
                            featured: true,
                            useCount: 0,
                            samplePrompt: 'Create a quick start guide for [topic] covering the basics in 5-7 easy steps with visuals and examples.'
                        }
                    ];
                    _i = 0, templates_1 = templates;
                    _a.label = 1;
                case 1:
                    if (!(_i < templates_1.length)) return [3 /*break*/, 6];
                    template = templates_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, prisma.leadMagnetTemplate.create({
                            data: template
                        })];
                case 3:
                    created = _a.sent();
                    console.log("\u2713 Created template: ".concat(created.name));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("\u2717 Failed to create template \"".concat(template.name, "\":"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log('\nSeeding complete!');
                    console.log('Note: Template URLs are placeholders. Upload actual template files to R2 and update URLs in database.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
