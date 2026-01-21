
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/academic.json');

class Academic {
    static getData() {
        if (!fs.existsSync(dataPath)) {
            return { streams: [] };
        }
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    static saveData(data) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }

    static getStreams() {
        return this.getData().streams;
    }

    static addLevel(streamId, levelData) {
        const data = this.getData();
        const stream = data.streams.find(s => s.id === streamId);
        if (!stream) throw new Error('Stream not found');

        stream.levels.push(levelData);
        this.saveData(data);
        return levelData;
    }

    static addSubject(streamId, levelId, subject) {
        const data = this.getData();
        const stream = data.streams.find(s => s.id === streamId);
        if (!stream) throw new Error('Stream not found');

        const level = stream.levels.find(l => l.id === levelId);
        if (!level) throw new Error('Level not found');

        level.subjects.push(subject);
        this.saveData(data);
        return subject;
    }
}

module.exports = Academic;
